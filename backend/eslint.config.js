import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import jsoncPlugin from "eslint-plugin-jsonc";
import jsoncParser from "jsonc-eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        rules: {
            indent: ["error", 4],
            quotes: ["error", "double"],
            "comma-dangle": ["error", "never"],
            "object-curly-spacing": ["error", "always"],
            semi: ["error", "always"],
            "no-multiple-empty-lines": ["error", { max: 9999, maxEOF: 0 }],
        },
    },
    {
        files: ["**/*.json", "**/*.jsonc", "**/*.json5"],
        plugins: { jsonc: jsoncPlugin },
        languageOptions: { parser: jsoncParser, languageId: "jsonc" },
        rules: {
            "jsonc/indent": ["error", 4],
            "jsonc/quotes": ["error", "double"],
            "jsonc/comma-dangle": ["error", "never"],
            "jsonc/object-curly-spacing": ["error", "always"],
            "no-multiple-empty-lines": ["error", { max: 9999, maxEOF: 0 }],
        },
    },
    {
        files: ["**/*.json"],
        plugins: { json },
        language: "json/json",
        extends: ["json/recommended"],
    },
    {
        files: ["**/*.jsonc"],
        plugins: { json },
        language: "json/jsonc",
        extends: ["json/recommended"],
    },
    {
        files: ["**/*.json5"],
        plugins: { json },
        language: "json/json5",
        extends: ["json/recommended"],
    },
    {
        files: ["**/*.md"],
        plugins: { markdown },
        language: "markdown/gfm",
        extends: ["markdown/recommended"],
    },
    {
        files: ["**/*.css"],
        plugins: { css },
        language: "css/css",
        extends: ["css/recommended"],
    },
    {
        files: ["package-lock.json"],
        plugins: { json },
        language: "json/json",
        rules: {
            "json/no-empty-keys": "off",
        },
    },
]);
import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import jsoncPlugin from "eslint-plugin-jsonc";
import jsoncParser from "jsonc-eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
    { 
        files: ["**/*.{js,mjs,cjs}"], 
        plugins: { js }, 
        extends: ["js/recommended"], 
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        rules: {
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "comma-dangle": ["error", "never"],
            "object-curly-spacing": ["error", "always"],
            "semi": ["error", "always"],
            "no-multiple-empty-lines": ["error", { "max": 9999, "maxEOF": 0 }]
        }
    },
    { 
        files: ["**/*.json", "**/*.jsonc", "**/*.json5"], 
        plugins: { jsonc: jsoncPlugin }, 
        languageOptions: { parser: jsoncParser, languageId: "jsonc" }, 
        rules: {
            "jsonc/indent": ["error", 4],
            "jsonc/quotes": ["error", "double"],
            "jsonc/comma-dangle": ["error", "never"],
            "jsonc/object-curly-spacing": ["error", "always"],
            "no-multiple-empty-lines": ["error", { "max": 9999, "maxEOF": 0 }]
        }
    },
    { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
    { files: ["**/*.jsonc"], plugins: { json }, language: "json/jsonc", extends: ["json/recommended"] },
    { files: ["**/*.json5"], plugins: { json }, language: "json/json5", extends: ["json/recommended"] },
    { files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm", extends: ["markdown/recommended"] },
    { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] }
    ,{ 
        files: ["package-lock.json"], 
        plugins: { json }, 
        language: "json/json", 
        rules: {
            "json/no-empty-keys": "off"
        } 
    }
]);
