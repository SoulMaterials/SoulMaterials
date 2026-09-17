// 🎃🩸 HALLOW KNIGHTS
// Put this file directly inside: data/hallow-knights.js

window.SSML_CRATE_DATA = window.SSML_CRATE_DATA || [];

window.SSML_CRATE_DATA.push({
    id: "hallow-knights",

    name: "🎃🩸 HALLOW KNIGHTS",

    tier: "mythic",

    // CHANGE THIS IMAGE URL TO YOUR CRATE IMAGE
    image: "https://media.discordapp.net/attachments/1535462023402364938/1550251695710142616/content.png?ex=6aada7e6&is=6aac5666&hm=43a9b041daa0852e12438059610c74b738a535584aac953a0f90011cb676694c&=&format=webp&quality=lossless&width=1280&height=641",

    // CHANGE THE CRATE PRICE HERE
    cost: 1,

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
                "Forgotten Pumpkin Kishin — RGB rainbow aura flowing left, orange-and-black Halloween flames, spectral pumpkin fire, black-red smoke, and cursed saint glow"
        },

        {
            id: "saint-of-the-hallow-night-forgotten-pumpkin-kishin",

            name: "H-E-A-D-L-E-S-S-H-O-R-S-E-K-I-S-H-I-N",

            rarity: "ULTRA",

            // EXTREMELY HARD TO GET
            chance: 2,

            // ROLE GLOW COLOR
            color: "#9900ff",

            // VIRTUAL SELL VALUE
            price: 200000000,

            effect:
                "HorseMadness"
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