import js from "@eslint/js";
import globals from "globals";
import jsoncPlugin from "eslint-plugin-jsonc";
import jsoncParser from "jsonc-eslint-parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import babelParser from "@babel/eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    ignores: ["**/node_modules/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: babelParser,
      parserOptions: {
        requireConfigFile: true,
        babelOptions: {
          presets: ["@babel/preset-react"]
        },
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react,
      "react-hooks": reactHooks
    },
    rules: {
      "indent": ["error", 2],
      "quotes": ["error", "double"],
      "comma-dangle": ["error", "never"],
      "object-curly-spacing": ["error", "always"],
      "semi": ["error", "always"],
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "no-multiple-empty-lines": ["error", { "max": 9999, "maxEOF": 0 }]
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    files: ["**/*.json"],
    plugins: {
      jsonc: jsoncPlugin
    },
    languageOptions: {
      parser: jsoncParser
    },
    rules: {
      "jsonc/indent": ["error", 2],
      "jsonc/quotes": ["error", "double"],
      "jsonc/comma-dangle": ["error", "never"],
      "jsonc/object-curly-spacing": ["error", "always"]
    }
  }
]);
