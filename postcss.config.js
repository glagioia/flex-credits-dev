export default {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
		"postcss-prefix-selector": {
			prefix: ".react-external__wrapper",
			transform: function (prefix, selector, prefixedSelector, filePath, rule) {
				if (selector === "body") {
					return "body" + prefix;
				} else {
					return prefixedSelector;
				}
			},
		},
	},
};
