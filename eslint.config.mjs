import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import firebaseRulesPlugin from "@firebase/eslint-plugin-security-rules";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  firebaseRulesPlugin.configs["flat/recommended"],
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", ".playwright-cli/**"],
  },
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
