# GitHub Pages Deployment Guide for TaskKarateWeb_v2

## Overview
This guide will help you deploy your Task Karate website (static site + SvelteKit dashboard) to GitHub Pages at `nullableninja.github.io/TaskKarateWeb_v2`.

## Deployment Methods

### Method 1: Automated with GitHub Actions (Recommended)
The repository includes a GitHub Actions workflow that automatically builds and deploys your site on every push to the master branch.

**Setup:**
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Under "Build and deployment", select "GitHub Actions" as the source
4. Push any changes to trigger automatic deployment

### Method 2: Manual Deployment Script
Use the provided deployment script for manual deployment.

## Prerequisites
- Node.js and npm installed
- Git repository initialized
- GitHub repository: `nullableninja/TaskKarateWeb_v2`

## Step 1: Build the SvelteKit Dashboard

Before deploying, you need to build the SvelteKit dashboard application:

```sh
cd student-dashboard
npm install
npm run build
```

This will create a `build` folder inside `student-dashboard/` containing the static output.

## Step 2: Prepare the Repository Structure

Your repository should have this structure for GitHub Pages:

```
TaskKarateWeb_v2/
├── .nojekyll                    # Prevents Jekyll processing
├── index.html                   # Main site entry
├── about.html
├── schedule.html
├── students.html
├── assets/
│   ├── js/
│   ├── styles/
│   └── data/
├── images/
├── partials/
└── student-dashboard/           # SvelteKit build output goes here
    ├── index.html
    ├── _app/
    └── ...
```

## Step 3: Move the Dashboard Build

After building, move the contents of `student-dashboard/build/` to replace the `student-dashboard/` folder:

```sh
# From the project root
cd student-dashboard
npm run build
cd ..

# Backup the source (optional)
mv student-dashboard student-dashboard-src

# Move the build output
mv student-dashboard-src/build student-dashboard
```

## Step 4: Initialize Git and Push to GitHub

If you haven't already initialized the repository:

```sh
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Task Karate website with SvelteKit dashboard"

# Add remote (replace with your actual repo URL)
git remote add origin https://github.com/nullableninja/TaskKarateWeb_v2.git

# Push to GitHub
git branch -M master
git push -u origin master
```

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/nullableninja/TaskKarateWeb_v2`
2. Click on **Settings**
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select the `master` branch
5. Click **Save**

GitHub will deploy your site to: `https://nullableninja.github.io/TaskKarateWeb_v2/`

## Step 6: Verify Deployment

After a few minutes, visit:
- Main site: `https://nullableninja.github.io/TaskKarateWeb_v2/`
- Student Dashboard: `https://nullableninja.github.io/TaskKarateWeb_v2/student-dashboard/`

## Configuration Changes Made

The website uses relative paths for local development compatibility. When deploying to GitHub Pages, a `<base href="/TaskKarateWeb_v2/">` tag is automatically added to HTML files to make all relative paths work correctly on GitHub Pages.

### Key Files Updated

#### Navigation Bar (`partials/navigation-bar.html`)
- Uses relative links (e.g., `index.html`, `schedule.html`)
- Base tag added during deployment makes these resolve correctly on GitHub Pages

#### HTML Files (index.html, about.html, schedule.html, students.html)
- All use relative paths (e.g., `assets/styles/main.css`)
- Work locally out of the box
- Base tag added during deployment for GitHub Pages compatibility

### JavaScript (`assets/js/partials.js`)
- Updated partial loading path to `/TaskKarateWeb_v2/partials/navigation-bar.html`

### SvelteKit Configuration (`student-dashboard/svelte.config.js`)
- Set base path to `/TaskKarateWeb_v2/student-dashboard` for production
- Configured static adapter for GitHub Pages

## Troubleshooting

### Dashboard 404 Errors
If the dashboard shows 404 errors, ensure:
- The `student-dashboard/` folder contains the built files (not the source)
- The `.nojekyll` file is present in the root
- The base path in `svelte.config.js` matches your repository name

### CSS/JS Not Loading
If styles or scripts aren't loading:
- Check that all paths start with `/TaskKarateWeb_v2/`
- Clear your browser cache
- Check the browser console for 404 errors

### Navigation Issues
If navigation isn't working:
- Verify the navigation bar is loading correctly
- Check that `partials.js` is using the correct base path

## Future Updates

When updating the dashboard:

1. Make changes in the source (`student-dashboard-src/` if you backed it up)
2. Rebuild: `npm run build`
3. Replace the `student-dashboard/` folder with the new build
4. Commit and push to GitHub

## Local Development

For local development, the site is configured to work without the base path:
- SvelteKit: `cd student-dashboard && npm run dev`
- Static site: Use a local server like `python -m http.server 8000`

The configuration automatically detects dev mode and removes the base path prefix.
