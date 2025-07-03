/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = {
  root: true,
  extends: [path.resolve(__dirname, "../.eslintrc.json")],
  parserOptions: {
    project: path.resolve(__dirname, "./tsconfig.json"),
    tsconfigRootDir: __dirname,
  },
};
