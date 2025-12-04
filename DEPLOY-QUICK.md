# Quick Deployment Reference

## Automated Deployment (Recommended)

Run the deployment script:

```sh
./deploy-github-pages.sh
```

This will:
1. Build the SvelteKit dashboard
2. Create a `deploy-temp` folder with all files ready for GitHub Pages
3. Show you the git commands to push to GitHub

Then follow the instructions printed by the script.

## Manual Deployment

### 1. Build the Dashboard
```sh
cd student-dashboard
npm install
npm run build
cd ..
```

### 2. Push to GitHub

```sh
# If starting fresh
git init
git remote add origin https://github.com/nullableninja/TaskKarateWeb_v2.git

# Add files
git add .
git commit -m "Deploy Task Karate website"

# Push
git branch -M master
git push -u origin master
```

### 3. Configure GitHub Pages

1. Go to repository Settings → Pages
2. Select `master` branch as source
3. Save

Your site will be live at: `https://nullableninja.github.io/TaskKarateWeb_v2/`

## Important Files

- `.nojekyll` - Tells GitHub Pages not to use Jekyll
- `DEPLOYMENT.md` - Full deployment guide with troubleshooting
- `deploy-github-pages.sh` - Automated deployment preparation
- `student-dashboard/svelte.config.js` - SvelteKit configuration with base path

## URLs After Deployment

- **Main site**: `https://nullableninja.github.io/TaskKarateWeb_v2/`
- **Dashboard**: `https://nullableninja.github.io/TaskKarateWeb_v2/student-dashboard/`
- **Schedule**: `https://nullableninja.github.io/TaskKarateWeb_v2/schedule.html`
- **About**: `https://nullableninja.github.io/TaskKarateWeb_v2/about.html`
- **Students**: `https://nullableninja.github.io/TaskKarateWeb_v2/students.html`

## What Was Changed

All files have been updated to use absolute paths with the `/TaskKarateWeb_v2/` base:

- ✅ Navigation bar links
- ✅ CSS and JavaScript references
- ✅ Image paths in navigation
- ✅ Partial loading paths
- ✅ SvelteKit base path configuration

## Testing Locally

The site works locally without changes because the SvelteKit config detects dev mode:

```sh
# For the dashboard
cd student-dashboard
npm run dev

# For the static site
python -m http.server 8000
```

## Need Help?

See `DEPLOYMENT.md` for detailed instructions and troubleshooting.
