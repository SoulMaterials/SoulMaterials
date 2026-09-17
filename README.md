# SSML Rare Archive — Simple Data Layout

There is only ONE data folder. Every crate has its own JavaScript file.

```text
ssml-fixed/
├── index.html
├── styles.css
├── app.js
└── data/
    ├── first-signal.js
    ├── new-member.js
    ├── sinners-court.js
    └── ... one file per crate
```

## Editing a crate
Open any file inside `data/`. Each file contains:
- crate name
- crate price
- crate color
- crate tier
- description
- the roles inside that crate
- each role's name
- rarity
- `chance` (hardness/weight; lower = harder)
- `color`
- `price` (virtual sell value)
- effect

Example:

```js
{
  "id": "sinners-faith",
  "name": "Sinner's Faith",
  "rarity": "RARE",
  "chance": 2.5,
  "color": "#ff3355",
  "price": 800000,
  "effect": "Crimson aura"
}
```

A smaller `chance` makes the role harder to roll. The website normalizes the roles in each crate to calculate the displayed odds.

## Important
The editor changes the current browser session only. A static GitHub page cannot rewrite its own `.js` files. To permanently save admin edits for every visitor, connect the site to a backend/database later.
