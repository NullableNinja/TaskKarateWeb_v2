# Task Karate Website - GitHub Pages Ready

This repository contains the Task Karate School website, a hybrid static site with an integrated SvelteKit student dashboard, configured for deployment on GitHub Pages.

## 🚀 Quick Start - Deployment

### Option 1: Automated (Recommended)
```sh
./deploy-github-pages.sh
```
Then follow the instructions to push to GitHub.

### Option 2: Manual
See [DEPLOY-QUICK.md](DEPLOY-QUICK.md) for manual deployment steps.

## 📁 Project Structure

```
TaskKarateWeb_v2/
├── index.html              # Main homepage
├── about.html              # About page
├── schedule.html           # Schedule page
├── students.html           # Student resources
├── assets/                 # CSS, JavaScript, and data
│   ├── js/                # Site JavaScript
│   ├── styles/            # Site CSS
│   └── data/              # JSON data files
├── images/                 # Site images and logos
├── partials/              # Reusable HTML components
│   ├── navigation-bar.html
│   └── footer.html
└── student-dashboard/      # SvelteKit application
    ├── src/               # Dashboard source code
    ├── static/            # Dashboard static assets
    └── build/             # Generated build output
```

## 🌐 Live URLs (After Deployment)

- **Main Site**: `https://nullableninja.github.io/TaskKarateWeb_v2/`
- **Student Dashboard**: `https://nullableninja.github.io/TaskKarateWeb_v2/student-dashboard/`
- **Schedule**: `https://nullableninja.github.io/TaskKarateWeb_v2/schedule.html`
- **About**: `https://nullableninja.github.io/TaskKarateWeb_v2/about.html`
- **Students**: `https://nullableninja.github.io/TaskKarateWeb_v2/students.html`

## 🛠️ Development

### Static Site
Serve locally with any HTTP server:
```sh
python -m http.server 8000
# Visit: http://localhost:8000
```

### SvelteKit Dashboard
```sh
cd student-dashboard
npm install
npm run dev
# Visit: http://localhost:5173
```

The configuration automatically adjusts paths for local development.

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide with troubleshooting
- **[DEPLOY-QUICK.md](DEPLOY-QUICK.md)** - Quick reference for deployment
- **[CHANGES.md](CHANGES.md)** - Summary of all configuration changes made

## 🔧 Deployment Scripts

- **`deploy-github-pages.sh`** - Complete deployment automation
- **`test-deployment.sh`** - Verify configuration before deploying
- **`build-dashboard.sh`** - Build only the SvelteKit dashboard

## ✅ Pre-Deployment Checklist

Run this to verify everything is ready:
```sh
./test-deployment.sh
```

This checks:
- ✓ All paths use correct base URL
- ✓ SvelteKit configuration is correct
- ✓ Dashboard builds successfully
- ✓ Required files exist

## 🎯 Key Features

- **Hybrid Architecture**: Static HTML site + SvelteKit SPA dashboard
- **GitHub Pages Ready**: All paths configured for `/TaskKarateWeb_v2/` base
- **Development Friendly**: Works locally without configuration changes
- **Responsive Design**: Mobile-friendly navigation and layouts
- **Theme Toggle**: Dark/light mode support
- **Student Dashboard**: Full-featured SPA with routing

## 🔒 Configuration Notes

All paths have been configured to use the absolute base path `/TaskKarateWeb_v2/`:
- Navigation links
- CSS and JavaScript references
- Image paths
- Partial loading
- SvelteKit routing

The SvelteKit app automatically detects dev mode and adjusts accordingly.

## 📝 Updating Content

### Static Pages
1. Edit HTML/CSS/JS files directly
2. Test locally
3. Commit and push to GitHub
4. GitHub Pages auto-updates

### Dashboard
1. Edit files in `student-dashboard/src/`
2. Test with `npm run dev`
3. Build with `npm run build`
4. Run `./deploy-github-pages.sh`
5. Push to GitHub

## 🐛 Troubleshooting

If something doesn't work after deployment:

1. **404 Errors**: Check that base paths include `/TaskKarateWeb_v2/`
2. **Dashboard Issues**: Verify `svelte.config.js` base path is correct
3. **Asset Loading**: Ensure `.nojekyll` file exists in root
4. **Navigation**: Check `partials/navigation-bar.html` has absolute paths

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting.

## 📱 Technology Stack

- **Static Site**: HTML5, CSS3, Vanilla JavaScript
- **Dashboard**: SvelteKit 2.x with static adapter
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: SVG icons
- **Fonts**: Bebas Neue, Inter (Google Fonts)

## 👤 Repository Info

- **Owner**: NullableNinja
- **Repo**: TaskKarateWeb_v2
- **Branch**: master
- **Local Path**: `/home/nullableninja/OneDrive/Web Design/TaskKarateWeb_v2`

## 📄 License

© Task Karate School • La Crosse, WI

---

**Ready to deploy?** Run `./deploy-github-pages.sh` and follow the instructions!
