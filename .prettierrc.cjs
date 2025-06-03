module.exports = {
  trailingComma: 'all',
  semi: true,
  tabWidth: 2,
  singleQuote: true,
  useTabs: false,
  arrowParens: 'avoid',
  printWidth: 100,
  overrides: [
    {
      files: '*.scss',
      options: {
        parser: 'scss',
      },
    },
  ],
};
