#!/bin/sh
# Complete deployment preparation script for GitHub Pages

set -e  # Exit on error

PROJECT_ROOT="/home/nullableninja/OneDrive/Web Design/TaskKarateWeb_v2"
cd "$PROJECT_ROOT"

echo "============================================"
echo "Task Karate Web - GitHub Pages Deployment"
echo "============================================"
echo ""

# Step 1: Build the SvelteKit dashboard
echo "Step 1: Building SvelteKit dashboard..."
cd student-dashboard

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Building dashboard for production..."
npm run build

cd ..

# Step 2: Prepare the deployment structure
echo ""
echo "Step 2: Preparing deployment structure..."

# Create a temporary deployment directory
DEPLOY_DIR="$PROJECT_ROOT/deploy-temp"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy static site files
echo "Copying static site files..."
cp -r assets "$DEPLOY_DIR/"
cp -r images "$DEPLOY_DIR/"
cp -r partials "$DEPLOY_DIR/"
cp *.html "$DEPLOY_DIR/" 2>/dev/null || true
cp .nojekyll "$DEPLOY_DIR/"

# Copy dashboard build
echo "Copying dashboard build..."
cp -r student-dashboard/build "$DEPLOY_DIR/student-dashboard"

echo ""
echo "============================================"
echo "Deployment preparation complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Review the files in: $DEPLOY_DIR"
echo "2. Initialize git in deploy-temp: cd $DEPLOY_DIR && git init"
echo "3. Add remote: git remote add origin https://github.com/nullableninja/TaskKarateWeb_v2.git"
echo "4. Add files: git add ."
echo "5. Commit: git commit -m 'Deploy Task Karate website'"
echo "6. Push: git branch -M master && git push -u origin master --force"
echo ""
echo "Or use the provided git commands:"
echo ""
echo "cd $DEPLOY_DIR"
echo "git init"
echo "git remote add origin https://github.com/nullableninja/TaskKarateWeb_v2.git"
echo "git add ."
echo "git commit -m 'Deploy Task Karate website with SvelteKit dashboard'"
echo "git branch -M master"
echo "git push -u origin master --force"
echo ""
