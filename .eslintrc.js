module.exports = {
  "env": {
    "browser": false,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "airbnb-base"
  ],
  "rules": {
    "import/prefer-default-export": "off",
    "import/no-mutable-exports": "off",
    "import/no-unresolved": "off",
    "import/no-extraneous-dependencies": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": "off",
    "lines-between-class-members": "off",
    "no-empty": ["error", {
      "allowEmptyCatch": true
    }],
    "no-underscore-dangle": "off",
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "no-new": "off",
    "arrow-body-style": "off",
    "no-empty-function": "off",
    "no-nested-ternary": "off",
    "no-return-assign": "off",
    "global-require": "off",
    "object-curly-spacing": "off",
    "max-len": "off",
    "comma-dangle": "off",
    "prefer-destructuring": "off",
    "class-methods-use-this": "off",
    "eol-last": "off",
    "eqeqeq": "off",
    "prefer-arrow-callback": "off",
    "prefer-promise-reject-errors": "off",
    "generator-star-spacing": "off",
    "new-cap": "off",
    "array-callback-return": "off",
    "consistent-return": "off"
  }
};
