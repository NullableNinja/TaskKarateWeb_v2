#!/bin/sh
# Test script to verify the build before deploying

set -e

PROJECT_ROOT="/home/nullableninja/OneDrive/Web Design/TaskKarateWeb_v2"
cd "$PROJECT_ROOT"

echo "============================================"
echo "Pre-deployment Verification"
echo "============================================"
echo ""

# Check if .nojekyll exists
echo "✓ Checking for .nojekyll file..."
if [ -f ".nojekyll" ]; then
  echo "  ✓ .nojekyll file exists"
else
  echo "  ✗ .nojekyll file missing - creating it"
  touch .nojekyll
fi

echo ""
echo "✓ Checking navigation bar paths..."
if grep -q "/TaskKarateWeb_v2/" "partials/navigation-bar.html"; then
  echo "  ✓ Navigation bar has correct base paths"
else
  echo "  ✗ Navigation bar missing base paths"
  exit 1
fi

echo ""
echo "✓ Checking HTML files..."
for file in index.html about.html schedule.html students.html; do
  if [ -f "$file" ]; then
    if grep -q "/TaskKarateWeb_v2/" "$file"; then
      echo "  ✓ $file has correct base paths"
    else
      echo "  ✗ $file missing base paths"
      exit 1
    fi
  fi
done

echo ""
echo "✓ Checking SvelteKit configuration..."
if grep -q "base: dev ? '' : '/TaskKarateWeb_v2/student-dashboard'" "student-dashboard/svelte.config.js"; then
  echo "  ✓ SvelteKit base path configured correctly"
else
  echo "  ✗ SvelteKit base path incorrect"
  exit 1
fi

echo ""
echo "✓ Checking partials.js..."
if grep -q "/TaskKarateWeb_v2/partials/navigation-bar.html" "assets/js/partials.js"; then
  echo "  ✓ partials.js has correct path"
else
  echo "  ✗ partials.js missing base path"
  exit 1
fi

echo ""
echo "✓ Testing SvelteKit build..."
cd student-dashboard
if [ ! -d "node_modules" ]; then
  echo "  Installing dependencies..."
  npm install
fi
echo "  Building..."
npm run build > /dev/null 2>&1
if [ -d "build" ]; then
  echo "  ✓ SvelteKit build successful"
  DASHBOARD_FILES=$(find build -type f | wc -l)
  echo "  ✓ Generated $DASHBOARD_FILES files"
else
  echo "  ✗ Build failed"
  exit 1
fi

cd ..

echo ""
echo "============================================"
echo "All checks passed! ✓"
echo "============================================"
echo ""
echo "You're ready to deploy. Run:"
echo "  ./deploy-github-pages.sh"
echo ""
