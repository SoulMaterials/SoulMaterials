// 🎃🩸 HALLOW KNIGHTS
// Put this file directly inside: data/hallow-knights.js

window.SSML_CRATE_DATA = window.SSML_CRATE_DATA || [];

window.SSML_CRATE_DATA.push({
    id: "hallow-knights",

    name: "🎃🩸 HALLOW KNIGHTS",

    tier: "mythic",

    // CHANGE THIS IMAGE URL TO YOUR CRATE IMAGE
    image: "https://chatgpt.com/backend-api/estuary/content?id=file_00000000ab8481f59c5be8c8bf46571f&ts=497128&p=fs&cid=1&sig=41a4a2709a2dc87080baefca7f5cc3afa21744c0c9118e57880d89bf7b223ba0&v=0",

    // CHANGE THE CRATE PRICE HERE
    cost: 9000000000000000,

    // CHANGE THE CRATE GLOW COLOR HERE
    accent: "#ff6a00",

    desc: "A forbidden Halloween archive. One title is almost impossible to obtain.",

    roles: [

        // =====================================================
        // RAREST ROLE
        // =====================================================

        {
            id: "saint-of-the-hallow-night-forgotten-pumpkin-kishin",

            name: "🎃🩸 S-A-I-N-T--O-F--T-H-E--H-A-L-L-O-W--N-I-G-H-T--T-H-E--F-O-R-G-O-T-T-E-N--P-U-M-P-K-I-N--K-I-S-H-I-N",

            rarity: "ULTRA",

            // EXTREMELY HARD TO GET
            chance: 0.00000001,

            // ROLE GLOW COLOR
            color: "#ff4a00",

            // VIRTUAL SELL VALUE
            price: 999999999999999,

            effect:
                "Forgotten Pumpkin Kishin — blood-orange Halloween aura, spectral pumpkin flames, black-red smoke, and cursed saint glow"
        },

        // =====================================================
        // OTHER HALLOW KNIGHTS ROLES
        // =====================================================

        {
            id: "hallow-knight",

            name: "Hallow Knight",

            rarity: "MYTHIC",

            chance: 0.25,

            color: "#ff7b22",

            price: 250000000000,

            effect: "Burning pumpkin knight aura"
        },

        {
            id: "pumpkin-saint",

            name: "Pumpkin Saint",

            rarity: "MYTHIC",

            chance: 0.15,

            color: "#ffd166",

            price: 175000000000,

            effect: "Golden saint halo with pumpkin sparks"
        },

        {
            id: "blood-moon-hallow",

            name: "Blood Moon Hallow",

            rarity: "LEGENDARY",

            chance: 0.75,

            color: "#ff1744",

            price: 50000000000,

            effect: "Blood moon aura and crimson moonlight"
        },

        {
            id: "forgotten-knight",

            name: "Forgotten Knight",

            rarity: "LEGENDARY",

            chance: 1.2,

            color: "#b46cff",

            price: 25000000000,

            effect: "Ancient purple knight aura"
        },

        {
            id: "pumpkin-watcher",

            name: "Pumpkin Watcher",

            rarity: "EPIC",

            chance: 4,

            color: "#ff9d3d",

            price: 5000000000,

            effect: "Floating pumpkin eyes"
        },

        {
            id: "hallow-guard",

            name: "Hallow Guard",

            rarity: "EPIC",

            chance: 7,

            color: "#ff5c35",

            price: 2500000000,

            effect: "Orange guard aura"
        },

        {
            id: "midnight-hallow",

            name: "Midnight Hallow",

            rarity: "RARE",

            chance: 15,

            color: "#704cff",

            price: 500000000,

            effect: "Midnight purple Halloween aura"
        }
    ]
});