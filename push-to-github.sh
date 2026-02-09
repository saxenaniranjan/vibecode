#!/bin/bash

# Script to push Valentines website to GitHub
# Run this in your terminal: bash push-to-github.sh

cd /Users/niranjansaxena/Desktop/Valentines

echo "🚀 Pushing to GitHub..."
echo "Repository: https://github.com/saxenaniranjan/vibecode"
echo ""
echo "You'll be prompted for GitHub credentials:"
echo "  - Username: saxenaniranjan"
echo "  - Password: Use your Personal Access Token (not your GitHub password)"
echo "    (Get one at: https://github.com/settings/tokens)"
echo ""

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Remote 'origin' is configured"
else
    echo "⚠️  Adding remote..."
    git remote add origin https://github.com/saxenaniranjan/vibecode.git
fi

echo ""
echo "Pushing to main branch..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Next step: Deploy on Vercel at https://vercel.com"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   1. Authentication failed - make sure you use a Personal Access Token"
    echo "   2. Remote repo has different history - try: git push -u origin main --force"
    echo ""
    echo "To force push (replace remote content):"
    echo "   git push -u origin main --force"
fi
