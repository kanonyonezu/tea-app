# Tea App Frontend

React frontend for the tea recommendation app.

## Run it

1. Start the Rails API on http://localhost:3000 (and the ML API on port 8000).
2. In this folder:

```bash
npm install
npm run dev
```

3. Open http://localhost:5173 and log in with `test@mail.com` / `secret`.

Requests to `/api` are forwarded to the Rails API by the Vite dev server (see `vite.config.js`).
