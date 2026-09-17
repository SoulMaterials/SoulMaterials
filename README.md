# SSML // RARE ARCHIVE

A static frontend prototype for the SSML title/crate concept.

## Included
- Sign-in gate and profile setup
- Username, avatar, banner and bio
- Guest / Member / Administrative access flow
- Administrative proof screen
- Virtual-credit crate system
- Animated title roll
- Rarity + odds viewer
- Backpack with duplicate stacking
- Virtual-credit selling with confirmation code
- Profile modal with banner/avatar
- Local activity feed
- Neon/glow VFX styling
- Responsive mobile layout

## Important
This prototype uses `localStorage`, so profile/inventory data is only saved in the visitor's browser. It is not real authentication and it does not synchronize users.

For a real public site, connect authentication + a database (for example Supabase/Firebase) and perform all currency, inventory, admin verification, and sell operations server-side.

The crate currency in this prototype is virtual and has no cash value. Do not connect the sell mechanic to real-money cash-out without implementing the legal/compliance requirements that apply to your jurisdiction.
