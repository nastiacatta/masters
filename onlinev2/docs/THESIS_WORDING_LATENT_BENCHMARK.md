# Thesis wording: latent benchmark point forecast (NotesMasters.pdf)

**Location**: Replace "posterior mean mapped to (0,1)" as the description of the forecast target in your thesis/notes.

**Correct wording**: If
- \(Y_t = \Phi(Z_t)\) and \(r_{i,t} = \Phi(m^Z_{i,t})\),
then \(r_{i,t}\) is the image of the **posterior mean in latent space**. Because \(\Phi\) is monotone, this corresponds to the **conditional median** of \(Y_t \mid X_{i,t}\), not generally the conditional mean \(\mathbb{E}[Y_t \mid X_{i,t}]\). For MAE, that is exactly the right target, so the construction is fine; only the wording needs correction.

**Action**: In NotesMasters.pdf (or wherever this is stated), change the phrase to say that the benchmark point forecast is the **conditional median** (image of the posterior mean in latent space under \(\Phi\)), not "posterior mean mapped to (0,1)" in the sense of the mean of \(Y\).
