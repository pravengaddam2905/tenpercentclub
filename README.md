# Ten Percent Club Website

## Clean URL Setup

This website uses clean URLs without the `.html` extension for a more professional appearance.

### How It Works

The `.htaccess` file automatically:
- Removes `.html` from all URLs
- Redirects old URLs (e.g., `/index.html`) to clean URLs (e.g., `/`)
- Forces HTTPS for security
- Removes `www` prefix for consistency

### URL Structure

**Old URLs (automatically redirected):**
- `https://10percentclub.ca/index.html` → `https://10percentclub.ca/`
- `https://10percentclub.ca/tools.html` → `https://10percentclub.ca/tools`

**New Clean URLs:**
- Home: `https://10percentclub.ca/`
- Tools: `https://10percentclub.ca/tools`
- Anchors: `https://10percentclub.ca/tools#cagr-calculator`

### Server Requirements

This requires Apache server with mod_rewrite enabled (standard on most web hosts including cPanel, Bluehost, SiteGround, etc.).

### Testing Locally

If testing locally, you may need to:
1. Enable Apache's mod_rewrite module
2. Set `AllowOverride All` in your Apache configuration
3. Restart Apache server

### Files Modified

- `.htaccess` - Server configuration for clean URLs
- `index.html` - Updated all internal links
- `tools.html` - Updated all internal links

### Support

If you encounter issues with clean URLs not working:
1. Check that `.htaccess` is uploaded to the root directory
2. Verify mod_rewrite is enabled on your server
3. Check server error logs for specific issues
4. Contact your hosting provider if needed
