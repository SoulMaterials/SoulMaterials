# SSML // RARE ARCHIVE

Render-ready SSML archive site.

## GitHub Pages
The site can still run as a static demo using browser localStorage.

## Render Web Service
This project now includes `server.js` and `package.json` so Render can run it as a Node/Express Web Service.

Use:
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: leave blank if these files are at the repository root
- Plan: Free is fine for testing

The server listens on `0.0.0.0` and uses Render's `PORT` environment variable.

## Shared accounts and friends
On Render, the browser uses `/api/*` for shared registration, login, directory, follows, friends, and equipped-title updates.

For persistent shared data, connect a Render PostgreSQL database and add its internal connection URL as:

`DATABASE_URL`

If `DATABASE_URL` is missing, the server uses temporary in-memory storage. That is useful for testing deployment, but friends, accounts, follows, and credits can disappear when the service restarts. For real persistence across devices and restarts, connect a Render PostgreSQL database and set `DATABASE_URL`.

Render's Node deploy docs: https://render.com/docs/deploy-node-express-app
Render Postgres connection docs: https://render.com/docs/postgresql-creating-connecting


## Shared username search and credit gifting
The directory searches usernames from the shared server. Administrative accounts also get a GIFT button beside search results. Credit gifting and setting balances are sent to the server so the target's virtual balance is shared across devices.

The friend endpoint stores both sides of the friendship in the `friends` JSONB fields, so the friend list remains available after refresh/restart when PostgreSQL is connected.
