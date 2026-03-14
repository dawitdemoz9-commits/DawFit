/**
 * Postbuild script: creates middleware.js.nft.json if missing.
 * Required for Next.js 16 + Turbopack builds on Vercel.
 */
const fs = require("fs");
const path = require("path");

const nftPath = path.join(
  process.cwd(),
  ".next",
  "server",
  "middleware.js.nft.json"
);

if (!fs.existsSync(nftPath)) {
  const nft = { version: 1, files: [] };
  fs.writeFileSync(nftPath, JSON.stringify(nft));
  console.log("[postbuild] Created middleware.js.nft.json");
} else {
  console.log("[postbuild] middleware.js.nft.json already exists");
}
