# SSML // RARE ARCHIVE

GitHub-ready static prototype for the SSML virtual-credit title/crate archive.

## Included

- Fixed JavaScript syntax error from the original prototype.
- 50+ collectible SSML titles with rarity, value, and individual glow/effect metadata.
- 20 progressively more expensive crates; later crates use stronger rarity pools.
- Animated crate rolling screen with skip button.
- Crate VIEW screen showing the calculated odds for that crate.
- Backpack with duplicate stacking (`x2`, `x3`, etc.).
- Virtual-credit spend/add animations.
- Sell confirmation using `SELL-SSML`.
- Sign-up flow with username, avatar, banner, bio, and Guest/Member/Administrative choice.
- Administrative verification using the demo code `SSML-ADMIN`.
- Member search/directory and profile viewing.
- Administrative profile controls to gift credits or set an exact virtual balance for an account.
- Administrative control-room user search.
- Profile backpack showing titles owned and duplicate counts.

## Important

This is a **frontend-only prototype**. Data is stored in `localStorage`, so accounts and balances are only shared inside the same browser/device. The administrative code is visible in client-side JavaScript and is **not secure authentication**.

For the real SSML site, replace the local storage layer with a backend/authentication service. Server-side authorization must verify administrative permissions before allowing credit changes, title ownership changes, or profile edits.

Credits in this prototype are virtual and have no cash value.
