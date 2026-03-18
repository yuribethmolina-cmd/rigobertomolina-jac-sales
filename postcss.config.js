import { createRequire } from "module";

const require = createRequire(import.meta.url);
const tailwindcss = require("./node_modules/tailwindcss");
const autoprefixer = require("./node_modules/autoprefixer");

export default {
  plugins: [tailwindcss(), autoprefixer()],
};
