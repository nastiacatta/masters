#!/usr/bin/env julia
# TODO: run once Julia environment is available.
#
# generate_michael_fixtures.jl
# ----------------------------
# One-shot Julia script that runs Michael's reference implementation on a
# stationary AR(1) panel at AUDIT_SEEDS × (T=300, N=4) and writes three JSON
# fixtures used by `onlinev2/tests/audit/test_bug_condition_a_michael_parity.py`
# and `test_bug_condition_e_payoff.py` to assert bit-parity between the
# Python port in `onlinev2/src/onlinev2/mechanism/michael_port.py` and the
# Julia reference in `michael/`.
#
# Usage:
#   julia --project=michael onlinev2/scripts/generate_michael_fixtures.jl
#
# Fixtures are written to `onlinev2/tests/audit/fixtures/`:
#   - julia_ogd_T300_N4.json
#   - julia_adaptive_robust_T300.json
#   - julia_main_rewards_T300.json
#
# IMPORTANT: The Python port and audit harness MUST NOT depend on Julia being
# available at CI time. Run this script once locally, commit the JSON
# fixtures, and CI will load them directly.

using Pkg
# Activate the michael project so UtilsFunctions, QuantileRegression, etc. resolve.
Pkg.activate(joinpath(@__DIR__, "..", "..", "michael"))

using JSON
using Random
using LinearAlgebra
using Statistics

include(joinpath(@__DIR__, "..", "..", "michael", "functions", "functions.jl"))
include(joinpath(@__DIR__, "..", "..", "michael", "functions", "functions_payoff.jl"))
include(joinpath(@__DIR__, "..", "..", "michael", "online_algorithms", "quantile_regression.jl"))
include(joinpath(@__DIR__, "..", "..", "michael", "online_algorithms",
    "adaptive_robust_quantile_regression.jl"))
include(joinpath(@__DIR__, "..", "..", "michael", "payoff", "shapley_values.jl"))

using .UtilsFunctions
using .UtilsFunctionsPayoff
using .QuantileRegression
using .AdaptiveRobustRegression
using .Shapley

# Mirror of the Python `dgps.stationary_ar1` construction (seed, T, N, phi=0.7)
# with per-forecaster Gaussian noise around the AR(1) mean.
function stationary_ar1(seed::Int, T::Int, N::Int; phi::Float64 = 0.7)
    rng = MersenneTwister(seed)
    y = zeros(Float64, T)
    y[1] = 0.5
    innov = 0.05 .* randn(rng, T)
    for t in 2:T
        y[t] = phi * y[t - 1] + (1.0 - phi) * 0.5 + innov[t]
    end
    y = clamp.(y, 0.0, 1.0)

    biases = (rand(rng, N) .- 0.5) .* 0.04  # ~ uniform(-0.02, 0.02)
    shifted = vcat([0.5], y[1:end-1])
    point = hcat([phi .* shifted .+ (1.0 - phi) * 0.5 .+ biases[i] for i in 1:N]...)
    point = clamp.(point, 0.0, 1.0)
    return (y = y, panel = point)
end

const AUDIT_SEEDS = [0, 1, 2, 42, 2024]
const T = 300
const N = 4
const Q = 0.5
const LR = 0.01

function run_ogd(seed::Int)
    data = stationary_ar1(seed, T, N)
    y = data.y
    panel = data.panel  # (T, N)
    w = fill(1.0 / N, N)
    weights_hist = zeros(T, N)
    y_hat = zeros(T)
    weights_hist[1, :] = w
    for t in 2:T
        x_t = panel[t, :]
        w_new, y_hat_t = online_quantile_regression_update(x_t, w, y[t], Q, LR)
        w = w_new
        weights_hist[t, :] = w
        y_hat[t] = y_hat_t
    end
    return Dict("weights" => weights_hist, "y_hat" => y_hat)
end

function run_adaptive_robust(seed::Int)
    data = stationary_ar1(seed, T, N)
    y = data.y
    panel = data.panel
    rng = MersenneTwister(seed + 10_000)
    w = fill(1.0 / N, N)
    D = zeros(N, N)
    alpha_hist = zeros(Int, T, N)
    for t in 1:T
        alpha_hist[t, :] = Int.(rand(rng, N) .< 0.05)
        if sum(alpha_hist[t, :]) == N
            alpha_hist[t, rand(rng, 1:N)] = 0
        end
    end
    weights_hist = zeros(T, N)
    y_hat = zeros(T)
    weights_hist[1, :] = w
    for t in 2:T
        x_t = panel[t, :]
        alpha = alpha_hist[t, :]
        w_new, D_new, y_hat_t = online_adaptive_robust_quantile_regression(
            x_t, y[t], w, D, alpha, Q, LR,
        )
        w, D = w_new, D_new
        weights_hist[t, :] = w
        y_hat[t] = y_hat_t
    end
    return Dict("weights" => weights_hist, "y_hat" => y_hat, "alpha" => alpha_hist)
end

function run_main_rewards(seed::Int)
    data = stationary_ar1(seed, T, N)
    y = data.y
    panel = data.panel
    w = fill(1.0 / N, N)
    weights_hist = zeros(T, N)
    payoffs_hist = zeros(T, N)
    rewards_hist = zeros(T, N)
    weights_hist[1, :] = w
    delta = 0.7
    rho = 0.999
    total_reward = 100.0
    for t in 2:T
        x_t = panel[t, :]
        w_new, _ = online_quantile_regression_update(x_t, w, y[t], Q, LR)
        shapley = shapley_payoff(x_t, w, y[t], Q)
        losses = [max(Q, 1.0 - Q) * abs(y[t] - x_t[i]) for i in 1:N]
        total_L = sum(losses)
        scores = total_L <= 0.0 ? fill(1.0 / N, N) : 1.0 .- (losses ./ total_L)
        payoffs_hist[t, :] = payoff_update(payoffs_hist[t - 1, :], shapley, rho)
        r_in = delta .* total_reward .* (max.(0.0, payoffs_hist[t, :]) ./
            max(sum(max.(0.0, payoffs_hist[t, :])), 1e-12))
        r_out = (1.0 - delta) .* total_reward .* (scores ./ max(sum(scores), 1e-12))
        rewards_hist[t, :] = r_in .+ r_out
        w = w_new
        weights_hist[t, :] = w
    end
    return Dict(
        "weights" => weights_hist,
        "payoffs" => payoffs_hist,
        "rewards" => rewards_hist,
    )
end

function to_json(d)
    Dict(k => (v isa AbstractArray ? collect(v) : v) for (k, v) in d)
end

const FIXTURE_DIR = joinpath(@__DIR__, "..", "tests", "audit", "fixtures")
mkpath(FIXTURE_DIR)

ogd_all = Dict(string(s) => to_json(run_ogd(s)) for s in AUDIT_SEEDS)
ar_all  = Dict(string(s) => to_json(run_adaptive_robust(s)) for s in AUDIT_SEEDS)
mr_all  = Dict(string(s) => to_json(run_main_rewards(s)) for s in AUDIT_SEEDS)

open(joinpath(FIXTURE_DIR, "julia_ogd_T300_N4.json"), "w") do f
    JSON.print(f, ogd_all)
end
open(joinpath(FIXTURE_DIR, "julia_adaptive_robust_T300.json"), "w") do f
    JSON.print(f, ar_all)
end
open(joinpath(FIXTURE_DIR, "julia_main_rewards_T300.json"), "w") do f
    JSON.print(f, mr_all)
end

println("Wrote fixtures to $FIXTURE_DIR")
