import numpy as np
from scipy.stats import norm


def _ar1_mu(T: int, rng: np.random.Generator, rho: float, sigma_state: float, mu0: float) -> np.ndarray:
    mu = np.zeros(T, dtype=np.float64)
    mu[0] = float(mu0)
    for t in range(1, T):
        mu[t] = rho * mu[t - 1] + rng.normal(0.0, sigma_state)
    return mu


def _link_forward(z: np.ndarray, link: str) -> np.ndarray:
    if link == "probit":
        return norm.cdf(z).astype(np.float64)
    if link == "identity":
        return np.clip(z, 0.0, 1.0).astype(np.float64)
    raise ValueError("link must be 'probit' or 'identity'")


def _link_inverse(y: np.ndarray, link: str) -> np.ndarray:
    y = np.asarray(y, dtype=np.float64)
    if link == "probit":
        y = np.clip(y, 1e-12, 1.0 - 1e-12)
        return norm.ppf(y).astype(np.float64)
    if link == "identity":
        return y.astype(np.float64)
    raise ValueError("link must be 'probit' or 'identity'")


def generate_truth_and_reports(
    T: int,
    n_forecasters: int,
    seed: int | None = None,
    *,
    method: int = 1,
    sigmas: np.ndarray | None = None,
    w: np.ndarray | None = None,
    normalise_w: bool = True,
    sigma_eps: float = 0.25,
    rho_mu: float = 0.98,
    sigma_state: float = 0.35,
    mu0: float = 0.0,
    sigma_mu_noise: float = 1.0,
    link: str = "probit",
):
    """
    Gaussian generator with 3 methods.

    Intrinsic skill controls:
      - smaller sigmas[i] => forecaster i is intrinsically better (less noisy)
      - larger w[i]       => outcome is more aligned to forecaster i

    method=1 and method=2 are the same model; method=2 just uses the expanded form of Y.
    method=3 adds mean shocks eta_{i,t} ~ N(0, sigma_mu_noise^2).
    """
    rng = np.random.default_rng(seed)

    if sigmas is None:
        sigmas = np.full(n_forecasters, 0.5, dtype=np.float64)
    else:
        sigmas = np.asarray(sigmas, dtype=np.float64).ravel()
        if sigmas.size != n_forecasters:
            raise ValueError("sigmas must have length n_forecasters")

    if w is None:
        w = np.ones(n_forecasters, dtype=np.float64) / float(n_forecasters)
    else:
        w = np.asarray(w, dtype=np.float64).ravel()
        if w.size != n_forecasters:
            raise ValueError("w must have length n_forecasters")
        if normalise_w:
            s = float(np.sum(np.abs(w)))
            w = w / s if s > 0 else np.ones(n_forecasters, dtype=np.float64) / float(n_forecasters)

    mu_t = _ar1_mu(T=T, rng=rng, rho=rho_mu, sigma_state=sigma_state, mu0=mu0)

    xi = rng.normal(0.0, 1.0, size=(n_forecasters, T)).astype(np.float64)
    eps_y = rng.normal(0.0, 1.0, size=T).astype(np.float64)

    if method == 3:
        eta = rng.normal(0.0, sigma_mu_noise, size=(n_forecasters, T)).astype(np.float64)
    else:
        eta = np.zeros((n_forecasters, T), dtype=np.float64)

    centres = mu_t[None, :] + eta
    x_latent = centres + sigmas[:, None] * xi

    if method == 1:
        y_latent = (w[:, None] * x_latent).sum(axis=0) + sigma_eps * eps_y
    elif method == 2:
        y_latent = (w[:, None] * centres).sum(axis=0) + (w[:, None] * (sigmas[:, None] * xi)).sum(axis=0) + sigma_eps * eps_y
    elif method == 3:
        y_latent = (w[:, None] * centres).sum(axis=0) + (w[:, None] * (sigmas[:, None] * xi)).sum(axis=0) + sigma_eps * eps_y
    else:
        raise ValueError("method must be 1, 2, or 3")

    y = _link_forward(y_latent, link=link)
    reports = _link_forward(x_latent, link=link)

    return y, reports, sigmas


def generate_truth_and_quantile_reports(T: int, n: int, taus, seed=None, *, method: int = 1, sigmas=None, w=None,
                                       normalise_w: bool = True, sigma_eps: float = 0.25, rho_mu: float = 0.98,
                                       sigma_state: float = 0.35, mu0: float = 0.0, sigma_mu_noise: float = 1.0,
                                       link: str = "probit"):
    """
    Quantile forecasts built around the (latent) point report x_latent with dispersion sigmas[i]:
      q_latent = x_latent + sigmas[i] * Phi^{-1}(tau)
      q = link(q_latent)
    """
    rng = np.random.default_rng(seed)
    taus = np.asarray(taus, dtype=np.float64)
    K = len(taus)
    z_tau = norm.ppf(taus).astype(np.float64)

    y, point_reports, sigmas_used = generate_truth_and_reports(
        T=T,
        n_forecasters=n,
        seed=seed,
        method=method,
        sigmas=sigmas,
        w=w,
        normalise_w=normalise_w,
        sigma_eps=sigma_eps,
        rho_mu=rho_mu,
        sigma_state=sigma_state,
        mu0=mu0,
        sigma_mu_noise=sigma_mu_noise,
        link=link,
    )

    point_latent = _link_inverse(point_reports, link=link)

    q_reports = np.zeros((n, T, K), dtype=np.float64)
    for i in range(n):
        q_latent = point_latent[i, :, None] + float(sigmas_used[i]) * z_tau[None, :]
        q_reports[i] = _link_forward(q_latent, link=link)

    tau_order = np.argsort(taus)
    for i in range(n):
        for t in range(T):
            row = q_reports[i, t, tau_order]
            q_reports[i, t, tau_order] = np.maximum.accumulate(row)

    return y, q_reports, sigmas_used


def generate_client_report(y, T, seed=None, *, link: str = "probit", client_sigma: float = 0.25):
    rng = np.random.default_rng(seed)
    y_latent = _link_inverse(np.asarray(y, dtype=np.float64).ravel(), link=link)
    client_latent = y_latent + rng.normal(0.0, client_sigma, size=T)
    return _link_forward(client_latent, link=link)


def generate_client_quantile_report(y, T, taus, seed=None, *, link: str = "probit", client_sigma: float = 0.25):
    rng = np.random.default_rng(seed)
    taus = np.asarray(taus, dtype=np.float64)
    z_tau = norm.ppf(taus).astype(np.float64)

    y_latent = _link_inverse(np.asarray(y, dtype=np.float64).ravel(), link=link)
    centre = y_latent + rng.normal(0.0, client_sigma, size=T)

    q_latent = centre[:, None] + client_sigma * z_tau[None, :]
    q = _link_forward(q_latent, link=link)

    tau_order = np.argsort(taus)
    for t in range(T):
        row = q[t, tau_order]
        q[t, tau_order] = np.maximum.accumulate(row)

    return q


def _project_simplex(v: np.ndarray) -> np.ndarray:
    """Project v onto simplex {w: w>=0, sum(w)=1}."""
    v = np.asarray(v, dtype=np.float64).flatten()
    n = len(v)
    u = np.sort(v)[::-1]
    cssv = np.cumsum(u) - 1.0
    rho = int(n)
    for k in range(1, n + 1):
        if u[k - 1] > cssv[k - 1] / k:
            rho = k
    tau = cssv[rho - 1] / rho
    return np.maximum(v - tau, 0.0)


def online_weight_learning(
    y: np.ndarray,
    reports: np.ndarray,
    eta: float = 0.05,
    w0: np.ndarray | None = None,
) -> np.ndarray:
    """
    Online LMS: at each t, y_hat = w @ reports_t, update w by gradient of (y_t - y_hat)^2, project to simplex.
    reports shape (n_forecasters, T). Returns weight history (n_forecasters, T).
    """
    n, T = reports.shape
    if w0 is None:
        w = np.ones(n, dtype=np.float64) / n
    else:
        w = np.asarray(w0, dtype=np.float64).ravel()
        w = _project_simplex(w)
    w_hist = np.zeros((n, T), dtype=np.float64)
    for t in range(T):
        r_t = reports[:, t]
        y_t = float(y[t])
        y_hat = float(np.dot(w, r_t))
        err = y_t - y_hat
        # gradient of (y - w'r)^2 w.r.t. w is -2*err*r
        grad = -2.0 * err * r_t
        w = _project_simplex(w - eta * grad)
        w_hist[:, t] = w
    return w_hist


if __name__ == "__main__":
    import matplotlib
    matplotlib.use("Agg")  # non-GUI backend for saving to file
    import matplotlib.pyplot as plt

    T = 10000
    n_forecasters = 3
    seed = 42
    # Data generation: true weights (will be normalised to sum to 1)
    true_w = np.array([0.8, 0.1, 0.5], dtype=np.float64)
    # true_w_normalised = true_w / true_w.sum()  # [0.8/1.4, 0.1/1.4, 0.5/1.4]
    # Algorithm: start at equal weights 1/3 each
    w0 = np.ones(n_forecasters, dtype=np.float64) / n_forecasters

    fig, axes = plt.subplots(3, 1, figsize=(10, 9), sharex=True)
    fig.suptitle("Learned combination weights: 3 methods, 3 forecasters, T=10000 (true: 0.8, 0.1, 0.5 → normalised); algorithm starts at 1/3", fontsize=10)

    for method in (1, 2, 3):
        y, reports, sigmas = generate_truth_and_reports(
            T=T,
            n_forecasters=n_forecasters,
            seed=seed,
            method=method,
            w=true_w,
            sigma_mu_noise=1.0 if method == 3 else 0.0,
        )
        w_hist = online_weight_learning(y, reports, eta=0.05, w0=w0)
        ax = axes[method - 1]
        for i in range(n_forecasters):
            ax.plot(w_hist[i], label=f"$w_{i+1}$ (learned)", alpha=0.9)
        for i in range(n_forecasters):
            ax.axhline(true_w_normalised[i], color=f"C{i}", linestyle="--", alpha=0.8, label=f"true $w_{i+1}$={true_w_normalised[i]:.3f}")
        ax.set_ylabel("weight")
        ax.set_title(f"Method {method}")
        ax.legend(loc="upper right", fontsize=8)
        ax.grid(True, alpha=0.3)
        ax.set_ylim(-0.05, 1.05)
        print(f"Method {method} final learned weights: {w_hist[:, -1]}")

    axes[-1].set_xlabel("time t")
    plt.tight_layout()
    out_path = "data_generation_3methods_plot.png"
    plt.savefig(out_path, dpi=120)
    print(f"Plot saved to {out_path}")
    try:
        plt.show()
    except Exception:
        pass
