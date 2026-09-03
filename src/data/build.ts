/** Unix seconds at build time. Embedded into pages so the browser island can ask relays for newer articles. */
export const BUILD_TIME = Math.floor(Date.now() / 1000);
