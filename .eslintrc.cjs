// .eslintrc.cjs
module.exports = {
  env: {
    browser: true, // для script.js, который работает в браузере
    node: true,    // для server.js
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module', // если где-то будет import/export
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // дружим ESLint с Prettier
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error', // ошибки форматирования тоже как lint-ошибки
    // свои правила можно добавлять сюда
  },
};
