#!/bin/sh
# Build script for SvelteKit dashboard for GitHub Pages deployment

echo "Building SvelteKit dashboard..."

# Navigate to the dashboard directory
cd student-dashboard

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the dashboard
echo "Running build..."
npm run build

# Copy the build output to the parent directory
echo "Copying build output..."
rm -rf ../student-dashboard-build
cp -r build ../student-dashboard-build

echo "Build complete! Output is in student-dashboard-build/"
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Move student-dashboard-build contents to student-dashboard/ in your repo"
echo "2. Commit and push to GitHub"
echo "3. Enable GitHub Pages in your repository settings"
