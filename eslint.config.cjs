// Flat ESLint config for Next.js projects (ESLint v9+)
// This config does not rely on legacy "extends" behavior and uses
// plugin objects directly. It provides sensible defaults for Next.js
// projects and allows `npx eslint --fix` to run.

module.exports = [
  // Ignore build outputs and dependencies
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      '.venv/**',
      'dist/**',
      'build/**',
      '.git/**',
      '.idea/**',
      '.vscode/**',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: 'readonly', document: 'readonly', navigator: 'readonly' },
    },
    plugins: {
      react: require('eslint-plugin-react'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
      'import': require('eslint-plugin-import'),
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // allow JSX in .js files and disable old React-in-scope rule
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
      'react/react-in-jsx-scope': 'off',
      // warn on console by default but allow warn/error
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // basic import/order for readability
      'import/order': ['warn', { groups: [['builtin', 'external', 'internal']] }],
    },
  },
];
