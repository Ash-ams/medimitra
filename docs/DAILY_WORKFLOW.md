# Daily Update Workflow Guide

This guide explains how to maintain daily code updates for the AI Doctor Web Application project.

## 🚀 Quick Start - Daily Updates

### 1. Morning Setup (5 minutes)
```bash
# Navigate to your project
cd path/to/medimitra

# Check current status
git status

# Switch to development branch for daily work
git checkout development
```

### 2. Make Your Changes
Work on your features, bug fixes, or improvements as usual.

### 3. Daily Commit Process (10 minutes)

#### Step 1: Review Changes
```bash
# See what files have changed
git status

# Review specific changes
git diff
```

#### Step 2: Add Changes
```bash
# Add all changes
git add .

# OR add specific files
git add path/to/specific/file.js
```

#### Step 3: Commit with Descriptive Message
```bash
# Daily update format
git commit -m "Daily update: [Date] - [Brief description of changes]"

# Examples:
git commit -m "Daily update: 2024-01-15 - Fixed authentication bug in login page"
git commit -m "Daily update: 2024-01-15 - Added new ML model training script"
git commit -m "Daily update: 2024-01-15 - Improved avatar streaming performance"
```

#### Step 4: Push to Development
```bash
git push origin development
```

## 📅 Weekly Integration Process

### Every Friday (or end of week):

#### Step 1: Merge Development to Main
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge development changes
git merge development

# Push to main
git push origin main
```

#### Step 2: Create Release Tag (Optional)
```bash
# Create a version tag
git tag -a v1.0.1 -m "Weekly release: [Date]"
git push origin v1.0.1
```

## 🔄 Feature Development Workflow

### For New Features:

#### Step 1: Create Feature Branch
```bash
# From development branch
git checkout development
git checkout -b feature/your-feature-name

# Examples:
git checkout -b feature/user-dashboard
git checkout -b feature/voice-chat-integration
git checkout -b feature/ml-model-optimization
```

#### Step 2: Develop Feature
Make your changes, commit frequently:
```bash
git add .
git commit -m "Add: [feature description]"
```

#### Step 3: Push Feature Branch
```bash
git push origin feature/your-feature-name
```

#### Step 4: Create Pull Request
1. Go to GitHub repository
2. Click "Compare & pull request"
3. Select your feature branch
4. Add description and assign reviewers
5. Submit pull request

#### Step 5: Merge After Review
```bash
# After PR is approved and merged
git checkout development
git pull origin development
git branch -d feature/your-feature-name
```

## 🐛 Bug Fix Workflow

### For Bug Fixes:

#### Step 1: Create Bug Fix Branch
```bash
git checkout development
git checkout -b bugfix/issue-description

# Examples:
git checkout -b bugfix/login-authentication-error
git checkout -b bugfix/avatar-streaming-timeout
```

#### Step 2: Fix and Test
```bash
# Make your fixes
git add .
git commit -m "Fix: [bug description]"
```

#### Step 3: Push and Create PR
```bash
git push origin bugfix/issue-description
# Create pull request on GitHub
```

## 📊 Daily Update Checklist

### Every Day:
- [ ] Check `git status` for uncommitted changes
- [ ] Review changes with `git diff`
- [ ] Add changes with `git add .`
- [ ] Commit with descriptive message
- [ ] Push to development branch
- [ ] Update project documentation if needed

### Every Week:
- [ ] Merge development to main
- [ ] Create weekly release tag
- [ ] Review and close completed pull requests
- [ ] Update project status in README

### Every Month:
- [ ] Review and clean up old branches
- [ ] Update dependencies
- [ ] Create monthly release
- [ ] Archive completed features

## 🚨 Emergency Hotfix Process

### For Critical Issues:

#### Step 1: Create Hotfix Branch
```bash
git checkout main
git checkout -b hotfix/critical-issue-description
```

#### Step 2: Fix and Test
```bash
# Make minimal fix
git add .
git commit -m "Hotfix: [critical issue description]"
```

#### Step 3: Deploy Immediately
```bash
git push origin hotfix/critical-issue-description
# Create PR and merge immediately
```

#### Step 4: Merge Back to Development
```bash
git checkout development
git merge hotfix/critical-issue-description
git push origin development
```

## 📝 Commit Message Guidelines

### Format:
```
Type: Brief description

Detailed description (optional)
```

### Types:
- `Daily update:` - Regular daily commits
- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Updates to existing features
- `Refactor:` - Code refactoring
- `Docs:` - Documentation updates
- `Test:` - Test additions/updates
- `Hotfix:` - Critical bug fixes

### Examples:
```
Daily update: 2024-01-15 - Improved ML model accuracy

Add: User authentication with Firebase integration

Fix: Avatar streaming connection timeout issue

Update: Enhanced chat interface with better UX

Refactor: Optimized database queries for faster response

Docs: Updated API documentation for new endpoints

Test: Added unit tests for authentication module

Hotfix: Fixed critical security vulnerability in login
```

## 🔧 Useful Git Commands

### Daily Commands:
```bash
# Check status
git status

# See changes
git diff

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to remote
git push origin development

# Pull latest changes
git pull origin development
```

### Branch Management:
```bash
# List all branches
git branch -a

# Switch branch
git checkout branch-name

# Create new branch
git checkout -b new-branch-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```

### History and Logs:
```bash
# View commit history
git log --oneline

# View specific file history
git log --follow filename

# See changes in last commit
git show

# View branch differences
git diff main..development
```

## 🎯 Best Practices

### Do's:
- ✅ Commit daily with descriptive messages
- ✅ Use development branch for daily work
- ✅ Create feature branches for new features
- ✅ Test before committing
- ✅ Keep commits small and focused
- ✅ Update documentation with changes

### Don'ts:
- ❌ Commit directly to main branch
- ❌ Commit without testing
- ❌ Use vague commit messages
- ❌ Leave branches unmerged for weeks
- ❌ Commit sensitive information (API keys, passwords)
- ❌ Force push to shared branches

## 🆘 Troubleshooting

### Common Issues:

#### "Your branch is ahead of origin"
```bash
git push origin development
```

#### "Your branch is behind origin"
```bash
git pull origin development
```

#### Merge conflicts:
```bash
# Resolve conflicts in your editor
# Then:
git add .
git commit -m "Resolve merge conflicts"
```

#### Accidentally committed to wrong branch:
```bash
# Reset last commit
git reset --soft HEAD~1

# Switch to correct branch
git checkout development

# Commit again
git commit -m "Your message"
```

#### Lost changes:
```bash
# Check reflog
git reflog

# Recover from specific commit
git checkout commit-hash
```

---

**Remember**: Consistency is key! Make daily updates a habit, and your project will stay organized and up-to-date.

**Need Help?** Check the main README.md or create an issue on GitHub.
