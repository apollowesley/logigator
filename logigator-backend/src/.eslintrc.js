/* eslint-disable */

const path = require('path');

module.exports = {
	env: {
        node: true,
        es2020: true
    },
	parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
		project: path.join(__dirname, '..', 'tsconfig.json')
    },
    plugins: [
        '@typescript-eslint'
    ],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended'
	],
    rules: {
		'semi': ['error'],
		'comma-dangle': ['error', 'never'],
        '@typescript-eslint/indent': ['error', 'tab'],
		'@typescript-eslint/no-empty-function': ['off'],
		'@typescript-eslint/no-explicit-any': ['off'],
		'@typescript-eslint/explicit-module-boundary-types': ['off'],
		'@typescript-eslint/no-require-imports': ['warn'],
		'@typescript-eslint/no-shadow': ['error'],
		'@typescript-eslint/comma-spacing': ['warn'],
		'@typescript-eslint/no-useless-constructor': ['error'],
		'@typescript-eslint/member-ordering': ['warn', {'default': ['field', 'constructor', 'method']}],
		'quotes': 'off',
		'@typescript-eslint/quotes': ['error', 'single', {'avoidEscape': true, 'allowTemplateLiterals': true}],
		'@typescript-eslint/prefer-nullish-coalescing': ['error'],
		'@typescript-eslint/prefer-optional-chain': ['error']
    }
}
