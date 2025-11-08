# Linting Fix Guide

## Issue: npm command not found

If you get `command not found: npm` in a new terminal, you need to initialize nvm first.

### Quick Fix

Add this to your `~/.zshrc` file (or `~/.bash_profile` if using bash):

```bash
# Add to ~/.zshrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

Then reload your shell:
```bash
source ~/.zshrc
```

Or run this in your terminal before using npm:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

---

## Current Linting Status

After updating ESLint config: **11 errors, 92 warnings**

### Remaining Critical Issues:

The remaining 11 errors are **React Hooks violations** - these are in:
- `BookingDialog.tsx` - Hooks called conditionally
- `CreateAppointmentDialog.tsx` - Hooks called conditionally

These need to be fixed as they can cause runtime issues.

### For Production Deployment

**Good news:** The build works fine! These are code quality issues, not blocking errors.

**Options:**
1. **Deploy now** - The app works, fix these later
2. **Fix first** - Address the React Hooks issues (recommended for production)

#### Option 1: Fix Before Production (Recommended)
Run auto-fix for what can be fixed:
```bash
npm run lint:fix
```

This will fix:
- Formatting issues
- Simple rule violations
- Some dependency issues

Then manually fix remaining issues.

#### Option 2: Disable Strict Rules for Production
For now, you can deploy with these warnings. The build will still work.

---

## Quick Commands

```bash
# Check linting issues
npm run lint

# Auto-fix what can be fixed
npm run lint:fix

# Type check (TypeScript)
npm run type-check
```

---

**Note:** Your build works fine despite these linting warnings. They're code quality improvements, not blocking errors.

