module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    "plugin:react/recommended",
    "airbnb",
    "plugin:@typescript-eslint/recommended",
    "plugin:cypress/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "import"],
  rules: {
    // suppress errors for missing 'import React' in files
    "react/react-in-jsx-scope": "off",
    // allow tsx files to use jsx syntax
    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    ],
    // omit ts/tsx extensions from import statements
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    // override label-control association settings
    "jsx-a11y/label-has-associated-control": [
      "error",
      {
        labelComponents: ["CustomLabel"],
        labelAttributes: ["inputLabel"],
        controlComponents: ["CustomInput"],
        assert: "either",
        depth: 3,
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
};
