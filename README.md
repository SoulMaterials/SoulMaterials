# SSML // RARE ARCHIVE — Render Shared Edition

This build keeps the existing SSML frontend while adding a Render/Node backend for shared accounts, friends, follows, username search, equipped titles, and administrative virtual-credit tools.

## Render Web Service

Create a **Web Service** from the GitHub repository.

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: leave blank when `package.json`, `server.js`, and `index.html` are in the repository root
- The server listens on Render's `PORT` and `0.0.0.0` automatically.

## PostgreSQL — required for permanent shared data

Create a Render **Postgres** database in the same region as the web service.

Then open the **SoulMaterials-1** Web Service:

1. Open **Environment**.
2. Add an environment variable named `DATABASE_URL`.
3. Set its value to the database's **Internal Database URL**.
4. Save the variable.
5. Redeploy the web service.

Do not publish the database URL; it contains database credentials.

The server automatically creates the `users` table on startup. No manual SQL is required.

## Shared features

When PostgreSQL is connected:

- Accounts are stored on the server.
- Passwords are stored as bcrypt hashes.
- Username search uses the shared server directory.
- Follow/unfollow is shared across devices.
- Add/remove friend is shared and saved for both users.
- Friends appear on both profiles after refresh/login.
- Equipped titles are saved server-side.
- Administrative users can search users and gift/set virtual credits.
- Credit balances are stored in PostgreSQL.

## Important

Without `DATABASE_URL`, the server intentionally falls back to temporary in-memory storage. That is suitable only for deployment testing; a service restart can erase shared data.

The credits in this project are virtual archive credits only and have no real-money value.

## GitHub Pages

The frontend can still be opened as a static site, but cross-device shared features require the Render Web Service and PostgreSQL connection.
