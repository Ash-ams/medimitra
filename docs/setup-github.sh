#!/bin/bash

# AI Doctor Web Application - GitHub Setup Script
# This script helps you set up your project on GitHub

echo "🚀 Setting up MediMitra on GitHub..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Check if we're on the main branch
current_branch=$(git branch --show-current)
echo "📍 Current branch: $current_branch"

# Add and commit the workflow documentation
echo "📝 Adding daily workflow documentation..."
git add docs/DAILY_WORKFLOW.md
git commit -m "Add: Daily workflow documentation for project maintenance"

echo ""
echo "🎯 Next Steps to Create GitHub Repository:"
echo ""
echo "1. Go to https://github.com and sign in to your account"
echo "2. Click the '+' button in the top right corner"
echo "3. Select 'New repository'"
echo "4. Fill in the repository details:"
echo "   - Repository name: medimitra"
echo "   - Description: MediMitra: AI-Powered Multilingual Medical Chatbot and Telehealth Consultation Platform"
echo "   - Visibility: Choose Public or Private"
echo "   - DO NOT initialize with README (we already have one)"
echo "5. Click 'Create repository'"
echo ""
echo "6. After creating the repository, GitHub will show you commands like:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/medimitra.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "7. Run those commands in your terminal from this directory"
echo ""
echo "8. Then push the development branch:"
echo "   git push -u origin development"
echo ""
echo "📋 Your project structure:"
echo "   - main branch: Stable, production-ready code"
echo "   - development branch: Daily development work"
echo "   - Feature branches: For new features (create as needed)"
echo ""
echo "📚 Documentation created:"
echo "   - README.md: Project overview and setup instructions"
echo "   - DAILY_WORKFLOW.md: Complete guide for daily updates"
echo "   - .gitignore: Properly configured to exclude sensitive files"
echo ""
echo "✅ Ready to push to GitHub!"
echo ""
echo "💡 Daily workflow reminder:"
echo "   - Work on 'development' branch for daily updates"
echo "   - Use 'git add .' and 'git commit -m \"Daily update: [description]\"'"
echo "   - Push with 'git push origin development'"
echo "   - Merge to 'main' weekly for stable releases"
