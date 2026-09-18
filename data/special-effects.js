// ============================================================
// SPECIAL TITLE HIT EFFECTS
// ============================================================
// This file is ONLY for the big effect that appears when a
// title crosses the roll pointer.
//
// You can copy one block, change TITLE / IMAGE / SOUND, and
// you have another title using the exact same animation.
// You do NOT need to edit app.js for normal effects.
//
// IMPORTANT:
// - TITLE must match the title's NAME in your data/*.js file.
// - IMAGE is relative to the Gamble folder.
// - SOUND is relative to the Gamble folder.
// - COPY_FROM means: start with that title's animation/settings,
//   then use the IMAGE and SOUND written in this block.
// ============================================================

window.SSML_SPECIAL_EFFECTS = [

  // ----------------------------------------------------------
  // SAINT — ORIGINAL EFFECT
  // ----------------------------------------------------------
  {
    title: "🎃🩸 S-A-I-N-T--O-F--T-H-E--H-A-L-L-O-W--N-I-G-H-T--T-H-E--F-O-R-G-O-T-T-E-N--P-U-M-P-K-I-N--K-I-S-H-I-N",
    enabled: true,
    animation: "spin-expand",
    image: "saint-hit.png",
    sound: "assets/Doom effect.mp3",
    volume: 0.9
  },

   {
    title: "F-E-L-L-O-W🪽",
    enabled: true,
    animation: "spin-expand",
    image: "The wheel.png",
    sound: "assets/Doom effect.mp3",
    volume: 0.9
  },

   {
    title: "F-A-L-L-E-N-B-O-O-K-S-A-N-G-E-L",
    enabled: true,
    animation: "spin-expand",
    image: "The wheel.png",
    sound: "assets/Doom effect.mp3",
    volume: 0.10
  }

  // ----------------------------------------------------------
  // COPY THIS BLOCK TO MAKE ANOTHER ONE
  // Change ONLY these values first:
  //   title / image / sound
  // ----------------------------------------------------------
  // {
  //   title: "YOUR NEW TITLE NAME",
  //   copyFrom: "🎃🩸 S-A-I-N-T--O-F--T-H-E--H-A-L-L-O-W--N-I-G-H-T--T-H-E--F-O-R-G-O-T-T-E-N--P-U-M-P-K-I-N--K-I-S-H-I-N",
  //   enabled: true,
  //   image: "your-new-image.png",
  //   sound: "assets/your-new-sound.mp3",
  //   volume: 0.9
  // },

  // ----------------------------------------------------------
  // EXAMPLE — DELETE OR CHANGE THIS EXAMPLE
  // This copies Saint's rotation, but uses a different image
  // and sound.
  // ----------------------------------------------------------
  // {
  //   title: "Hallow Knight",
  //   copyFrom: "🎃🩸 S-A-I-N-T--O-F--T-H-E--H-A-L-L-O-W--N-I-G-H-T--T-H-E--F-O-R-G-O-T-T-E-N--P-U-M-P-K-I-N--K-I-S-H-I-N",
  //   enabled: true,
  //   image: "hallow-knight-hit.png",
  //   sound: "assets/hallow-knight.mp3",
  //   volume: 0.9
  // }

];
