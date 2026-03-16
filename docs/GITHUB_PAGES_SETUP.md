# GitHub Pages setup (fix 404)

If you see **"There isn't a GitHub Pages site here"** at `https://nastiacatta.github.io/masters/`, the workflow is probably not set as the publishing source yet.

## One-time setup

1. Open your repo **Settings** → **Pages**:
   - **Direct link:** https://github.com/nastiacatta/masters/settings/pages

2. Under **Build and deployment**:
   - **Source:** choose **GitHub Actions** (not "Deploy from a branch").

3. Trigger a deploy (one of):
   - Push a commit to `main`, or
   - **Actions** tab → workflow **"Deploy dashboard to GitHub Pages"** → **Run workflow**.

4. Wait for the **deploy** job to finish (green). Then open:
   - **https://nastiacatta.github.io/masters/**

If the workflow fails, check the **Actions** run logs (build and deploy jobs) for errors.
