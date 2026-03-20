# BlueBush

Tafe AI Assignment 01

## Live Demo

Visit the live site at: **https://azzamunza.github.io/BlueBush/**

## About

BlueBush is a premium sustainable Australian homewares website featuring:
- Home page with featured products
- Shop page with filtering and sorting
- Our Story page
- Journal page
- Contact page
- Account page
- FAQ page

## Development

This is a plain HTML/CSS/JavaScript website. No build step required.

Open any `.html` file from the `public/` directory in a browser to develop locally.

## Chatbot / AI Assistant

The site includes a chatbot widget (powered by **Chloe**, a Cloudflare Worker relay to NVIDIA's NIM API).

When a user sends a message the widget calls:

```
POST https://bluebush-chat-relay.azzamunza.workers.dev/api/chat
Content-Type: application/json

{ "message": "..." }
```

and renders the `reply` field from the JSON response.

### Configuration

By default the relay URL is hardcoded in `js/chatbot.js`. To override it without modifying source files, set `window.CHAT_API_BASE_URL` **before** the script loads, e.g. in a `js/env.js` file:

```html
<script>
  window.CHAT_API_BASE_URL = 'https://your-custom-worker.workers.dev';
</script>
<script src="js/chatbot.js"></script>
```

### Testing the relay

Run this snippet in your browser DevTools console while on the GitHub Pages site:

```js
fetch('https://bluebush-chat-relay.azzamunza.workers.dev/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello Chloe' })
}).then(r => r.json()).then(console.log);
```

Expected output: `{ reply: "…", conversationId: null }`

## Deployment

This site is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch. The contents of the `public/` directory are served directly.
