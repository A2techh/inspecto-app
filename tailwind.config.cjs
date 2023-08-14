/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: "jit",
	// These paths are just examples, customize them to match your project structure
	// purge: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"node_modules/daisyui/dist/**/*.js",
		"node_modules/react-daisyui/dist/**/*.js",
	],
	theme: {
		extend: {},
	},
	plugins: [require("daisyui")],
};
