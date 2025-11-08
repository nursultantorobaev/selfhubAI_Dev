# Fix: npm command not found

## Problem

When you open a **new terminal window**, you might get:
```bash
zsh: command not found: npm
```

This happens because **nvm** (Node Version Manager) needs to be loaded in each new terminal session.

## Solution

### Option 1: Quick Fix (Each Terminal Session)

Run this in your terminal before using npm:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Option 2: Permanent Fix (Recommended)

Add this to your `~/.zshrc` file:

```bash
# Open the file
nano ~/.zshrc

# Add these lines at the end:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

Then reload:
```bash
source ~/.zshrc
```

### Option 3: Verify nvm is installed

If nvm is not installed, install it:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Then restart your terminal or run `source ~/.zshrc`

---

## Verify It Works

After fixing, verify:
```bash
node --version  # Should show: v22.20.0
npm --version   # Should show: 10.9.3
```

---

## Current Status

✅ **npm is working** in your current terminal session
✅ **Linting is working** - run `npm run lint` to check
✅ **Build is working** - run `npm run build` to test

The "command not found" only happens in **new terminal windows** that haven't loaded nvm yet.


