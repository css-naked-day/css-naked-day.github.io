import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginToml from 'eslint-plugin-toml';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs}'],
		plugins: {
			js,
			'@stylistic': stylistic
		},
		extends: ['js/recommended'],
		languageOptions: {
			globals: globals.browser
		},
		rules: {
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/quotes': ['error', 'single'],
		}
	},

	...eslintPluginToml.configs['flat/standard'],
	{
		rules: {
			'toml/indent': ['error', 'tab'],
			'toml/key-spacing': ['warn', {'align': 'equal'}],
		}
	},
]);
