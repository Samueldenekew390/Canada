# Claude Code Website

This is a simple static website with a homepage, admin panel, OTP access page, and client document viewer.

## Files
- `index.html` - homepage with news, video, register modal, and OTP link.
- `admin/index.html` - admin interface to save documents and view client registrations.
- `otp.html` - OTP input page.
- `doc.html` - client document display page.
- `script.js` - shared client-side logic for all pages.
- `style.css` - shared styles for the website.

## How to use
1. Open `index.html` in a browser.
2. Click Register to open the registration form.
3. Fill in the client fields and submit.
4. The entry is saved in `localStorage`, and the app redirects to `admin/index.html`.
5. On `admin/index.html`, saved client submissions are listed.
6. Open `otp.html`, enter the OTP to see the client document in `doc.html`.

## Notes
- Storage is local to the browser.
- Uploaded images are stored as Base64 in `localStorage`.
