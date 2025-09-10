export default {
    preset: "node",
    testEnvironment: "node",
    transform: {},
    extensionsToTreatAsEsm: [".js"],
    globals: {
        "ts-jest": {
            useESM: true,
        },
    },
    moduleNameMapping: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
    testPathIgnorePatterns: ["/node_modules/", "/coverage/", "/dist/"],
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/**/*.test.js",
        "!src/**/*.spec.js",
        "!src/__tests__/**",
        "!src/scripts/**",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html", "json"],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.js"],
    testTimeout: 30000,
    maxWorkers: "50%",
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    testSequencer: "@jest/test-sequencer",
    reporters: [
        "default",
        [
            "jest-junit",
            {
                outputDirectory: "coverage",
                outputName: "junit.xml",
                classNameTemplate: "{classname}",
                titleTemplate: "{title}",
                ancestorSeparator: " › ",
                usePathForSuiteName: true,
            },
        ],
    ],
};
