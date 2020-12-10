module.exports = {
  globDirectory: "public\\",
  // globPatterns: ["**/*.{html,ico,json,css,js}", "src/images/*.{jpg,png}"],
  globPatterns: [
    "**/*.{html,ico,json,css}",
    "src/images/*.{jpg,png}",
    "srv/js/*.min.js",
  ],
  swSrc: "public/service-worker-base.js",
  swDest: "public/service-worker.js",
  globIgnores: ["..\\workbox-cli-config.js", "help\\**"],
};
