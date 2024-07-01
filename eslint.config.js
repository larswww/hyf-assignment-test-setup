import globals from 'globals';
import js from "@eslint/js";
import noAutofix from 'eslint-plugin-no-autofix';
import hyf from 'eslint-plugin-hyf';

export default [
  js.configs.recommended,
  {
    ignores: ['./1-JavaScript/Week3'],
    languageOptions: { 
      globals: { ...globals.browser, 
        ...globals.node, axios: 'readonly' },
    ecmaVersion: 2020,
    sourceType: 'module' },
    plugins: {
      'no-autofix': noAutofix,
      hyf,
    },
    rules: {
      'no-console': 'off',
      'no-var': 'error',
      'prefer-const': 'off',
      'no-autofix/prefer-const': 'warn',
      'new-cap': 'error',
      'no-useless-computed-key': 'error',
      eqeqeq: 'error',
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "ExpressionStatement > CallExpression > MemberExpression > Identifier[name='map']",
          message:
            'Results from `map` are unused. Replace `map` with `forEach`.',
        },
        {
          selector: "MemberExpression[property.name='innerText']",
          message:
            'The assignment tests do not support `innerText`. Please replace with `textContent`.',
        },
        {
          selector: "MemberExpression[property.name='innerHTML']",
          message:
            'Please do not use `innerHTML` in the assignment. Use `textContent` and/or `document.createElement()` instead.',
        },
        {
          selector: 'ForInStatement',
          message: 'Avoid `for in` loops. Prefer `Object.keys()` instead.',
        },
      ],
      'hyf/use-map-result': 'error',
      'hyf/camelcase': 'warn',
      'hyf/no-commented-out-code': 'warn',
    },
  },
];
/**
 

export default [{
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  plugins: ['hyf', 'no-autofix'],
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  globals: {
    axios: 'readonly',
  },
  rules: {
    'no-console': 'off',
    'no-var': 'error',
    'prefer-const': 'off',
    'no-autofix/prefer-const': 'warn',
    'new-cap': 'error',
    'no-useless-computed-key': 'error',
    eqeqeq: 'error',
    'no-restricted-syntax': [
      'warn',
      {
        selector:
          "ExpressionStatement > CallExpression > MemberExpression > Identifier[name='map']",
        message: 'Results from `map` are unused. Replace `map` with `forEach`.',
      },
      {
        selector: "MemberExpression[property.name='innerText']",
        message:
          'The assignment tests do not support `innerText`. Please replace with `textContent`.',
      },
      {
        selector: "MemberExpression[property.name='innerHTML']",
        message:
          'Please do not use `innerHTML` in the assignment. Use `textContent` and/or `document.createElement()` instead.',
      },
      {
        selector: 'ForInStatement',
        message: 'Avoid `for in` loops. Prefer `Object.keys()` instead.',
      },
    ],
    'hyf/use-map-result': 'error',
    'hyf/camelcase': 'warn',
    'hyf/no-commented-out-code': 'warn',
  },
}];


 */
