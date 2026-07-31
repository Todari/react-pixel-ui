const jsxA11y = require('eslint-plugin-jsx-a11y');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const library = require('./library');

module.exports = [
  ...library,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // The library intentionally builds imperative DOM adapters around refs.
      // These compiler-oriented rules reject ref composition and style writes
      // even though they run in layout effects/callbacks, not during render.
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
    },
  },
  {
    ignores: ['**/vite-env.d.ts'],
  },
];
