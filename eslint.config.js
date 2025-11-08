import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Production-friendly rules (warnings instead of errors for common patterns)
      "@typescript-eslint/no-explicit-any": "warn", // Allow 'any' but warn about it
      "@typescript-eslint/no-empty-object-type": "warn", // Allow empty interfaces
      "@typescript-eslint/no-require-imports": "warn", // Allow require() in config files
      "no-useless-escape": "warn", // Warn about unnecessary escapes
      "react-hooks/exhaustive-deps": "warn", // Warn about missing dependencies
    },
  },
);
