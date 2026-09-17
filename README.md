# SSML // RARE ARCHIVE

Static GitHub-ready virtual-credit archive prototype.

## Folder layout

```text
ssml-fixed/
├── index.html
├── styles.css
├── app.js
└── data/
    ├── roles/
    │   └── roles.js
    └── crates/
        └── crates.js
```

## Editing titles / roles

Open `data/roles/roles.js`.

Each role uses:

```js
["role-id", "ROLE NAME", "RARITY", baseChance, sellValue, "#HEXCOLOR", "visual effect"]
```

- `ROLE NAME` = title shown on the site
- `RARITY` = COMMON / UNCOMMON / RARE / EPIC / LEGENDARY / MYTHIC / ULTRA
- `baseChance` = difficulty weight. Lower number = harder to roll.
- `sellValue` = virtual credit value
- `#HEXCOLOR` = glow and border color
- `visual effect` = text describing the title effect

Example:

```js
["void-king", "VOID KING", "MYTHIC", 0.003, 2500000, "#9b6cff", "Purple void crown"]
```

## Editing crates

Open `data/crates/crates.js`.

Each crate uses:

```js
["crate-id", "CRATE NAME", "mythic", 1000000, "Description", "#HEXCOLOR", ["role-id-1", "role-id-2"]]
```

Change the price, color, tier, description, and role pool without touching the main application.

The roll system reads the selected role pool and uses each role's `baseChance` as its weight. Expensive crates are intentionally populated with stronger role pools and receive a small quality boost.

## Administrative editor

The site also has an ADMINISTRATIVE-only `EDITOR` button. It lets an administrative test account change role name, rarity, glow color, difficulty weight, sell value, effect, and crate settings in the current browser session.

The code files remain the source of truth for a GitHub deployment.

## Sign-in/storage

The sign-in flow is intentionally defensive:

- New accounts can be created from the first `WAIT!` gate.
- Existing local accounts can sign in by username.
- Uploaded profile images are resized/compressed before being stored, preventing most browser `localStorage` quota failures.
- Invalid old archive data is ignored instead of crashing the entire page.
- Old `ssmlRareArchiveV3` data is still read for migration.

This is a frontend prototype. `localStorage` is browser-local. A real shared SSML site needs a server/database and real authentication before multiple visitors can share accounts, balances, inventories, or administrative permissions.

All credits in this prototype are virtual and have no cash value.
