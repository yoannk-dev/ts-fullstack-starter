import rootConfig from "../../eslint.config.js";

export default [
  { ignores: ["src/router/generated/**", "eslint.config.js"] },
  ...rootConfig,
  {
    files: ["**/*.module.ts"],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
];
