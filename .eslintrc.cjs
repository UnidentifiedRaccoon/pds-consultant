/* ESLint config for Node 20 + TypeScript + ESM */
module.exports = {
  root: true,
  env: { node: true, es2023: true },
  ignorePatterns: ['dist/', 'node_modules/', '*.d.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:n/recommended',
    'plugin:promise/recommended',
    // этот пресет отключит конфликтующие правила и включит ошибку,
    // если код не отформатирован по Prettier:
    'plugin:prettier/recommended',
  ],
  settings: {
    'import/resolver': {
      typescript: true,
      node: { extensions: ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'] },
    },
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'n/no-unsupported-features/es-syntax': 'off',
    'n/no-missing-import': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
