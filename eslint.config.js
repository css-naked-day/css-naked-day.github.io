import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintPluginToml from 'eslint-plugin-toml';

export default defineConfig([
	...eslintPluginToml.configs['flat/recommended'],
	{
		files: ['**/*.{js,mjs,cjs}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: {
			globals: globals.browser
		}
	},
]);
