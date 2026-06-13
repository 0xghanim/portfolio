# 0xGhanim Portfolio

A responsive static portfolio for Abdallah Ghanim, penetration tester and computer science student.

## Configure your profiles

Edit `config.js` and replace the example email and profile URLs with your real accounts. The Medium section uses `mediumUsername` to load new posts automatically from:

```text
https://medium.com/feed/@0xghanim
```

## Run locally

You can open `index.html` directly, but the Medium feed is best tested through a local web server:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

The site has no build step. Upload all files to GitHub Pages, Netlify, Cloudflare Pages, or any static web host.
