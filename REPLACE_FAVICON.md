# Replace Favicon Instructions

The current `favicon.ico` file contains the Lovable logo. You need to replace it with your SelfHub AI logo.

## Option 1: Use the SVG Favicon (Recommended)
I've created a simple SVG favicon with "S" for SelfHub AI. Modern browsers will use this.

## Option 2: Create Your Own Favicon

1. **Create a 32x32 or 64x64 pixel image** with your SelfHub AI logo
2. **Convert to ICO format** using:
   - Online tool: https://favicon.io/favicon-converter/
   - Or use ImageMagick: `convert logo.png -resize 32x32 favicon.ico`
3. **Replace the file**: Save as `public/favicon.ico`

## Option 3: Use a Favicon Generator
1. Go to https://favicon.io/
2. Upload your logo or create one
3. Download the generated favicon.ico
4. Replace `public/favicon.ico` with the new file

## Clear Browser Cache
After replacing the favicon:
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache
3. The new favicon should appear

## Files to Replace
- `public/favicon.ico` - Main favicon file
- The SVG version (`favicon.svg`) is already created and will work in modern browsers

