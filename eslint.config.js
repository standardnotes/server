const tseslint = require('typescript-eslint')

module.exports = [
  // JavaScript files (including jest configs)
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // Basic ESLint rules from original configuration
      'block-scoped-var': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      curly: ['error', 'all'],
      'no-confusing-arrow': 'error',
      'no-inline-comments': 'warn',
      'no-invalid-this': 'error',
      'no-return-assign': 'warn',
      'no-constructor-return': 'error',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unmodified-loop-condition': 'error',
      'no-unused-private-class-members': 'error',
      'object-curly-spacing': ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
    },
  },
  // TypeScript files
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    files: ['**/*.ts'],
    rules: {
      // Override TypeScript rules to match original configuration
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
      // Basic ESLint rules
      'block-scoped-var': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      curly: ['error', 'all'],
      'no-confusing-arrow': 'error',
      'no-inline-comments': 'warn',
      'no-invalid-this': 'error',
      'no-return-assign': 'warn',
      'no-constructor-return': 'error',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unmodified-loop-condition': 'error',
      'no-unused-private-class-members': 'error',
      'object-curly-spacing': ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
    },
  },
  {
    // Global ignores for all packages
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/uploads/**',
      '**/data/**',
      '**/test-setup.ts',
      '**/*.db',
      '**/migrations/**',
      '**/lib/**',
      '**/docker/**',
      '**/supervisor/**',
      '**/scripts/**',
      '**/jest.config.js',
      'bundle.sh',
      'docker-compose*.yml',
      'Dockerfile*',
      '.pnp.*',
      '.yarn/**',
      'logs/**',
    ],
  },
]
