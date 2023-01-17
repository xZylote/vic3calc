/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-typescript', '@vue/eslint-config-prettier'],
  plugins: ['simple-import-sort'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'simple-import-sort/imports': ['error'],
    'simple-import-sort/exports': ['error'],
    'max-len': 'off',
    'vue/max-len': ['error', { code: 300 }],
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/semi': ['error'],
    quotes: ['error', 'single'],
  },
  ignorePatterns: ['src/assets/vic3/data*'],
};
