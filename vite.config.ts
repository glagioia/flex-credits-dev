import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import replace from "@rollup/plugin-replace";
import { env } from "process";
import packageJson from './package.json' with { type: 'json' };

const cdnUrl = `https://a.sfdcstatic.com/digital/@sfdc-www/open-blade-libs/${packageJson.name}/v${packageJson.version}/`;
const baseUrl = env.VITE_DEPLOY_TARGET === 'vercel' ? '/' : cdnUrl;

// Known asset directories that should be transformed to CDN URLs
const ASSET_DIRS = ['images', 'assets', 'fonts', 'videos', 'docs', 'static'] as const;

// Supported asset extensions
const ASSET_EXTENSIONS = [
	'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico',  // Images
	'pdf',                                               // Documents
	'mp4', 'webm', 'ogg',                               // Video
	'mp3', 'wav', 'flac', 'aac',                        // Audio
	'woff', 'woff2', 'ttf', 'eot',                      // Fonts
] as const;

// This changes the public asset URLs in the JS/JSX code to CDN URLs
const publicAssetTransform = (): Plugin => ({
	name: 'public-asset-transform',
	enforce: 'post',
	generateBundle(options, bundle) {
		if (env.NODE_ENV !== 'production') return;

		const dirsPattern = ASSET_DIRS.join('|');
		const extPattern = ASSET_EXTENSIONS.join('|');
		
		// More explicit regex pattern:
		// - Captures the quote character
		// - Matches paths starting with / followed by known asset dirs
		// - Only matches file paths (not URLs with protocols)
		// - Requires a valid asset extension
		const assetRegex = new RegExp(
			`(['"\`])\\/(${dirsPattern})\\/([^'"\`\\s]+\\.(${extPattern}))\\1`,
			'g'
		);

		for (const fileName in bundle) {
			const file = bundle[fileName];
			if (file.type !== 'chunk' || !file.code) continue;

			file.code = file.code.replace(
				assetRegex,
				(match, quote, dir, pathWithExt) => {
					// Skip if the path looks like it's already a full URL
					if (pathWithExt.includes('://') || pathWithExt.startsWith('//')) {
						return match;
					}
					return `${quote}${baseUrl}${dir}/${pathWithExt}${quote}`;
				}
			);
		}
	}
});

const addTimestamp = (): Plugin => ({
	name: 'add-timestamp',
	generateBundle(options, bundle) {
		if (env.NODE_ENV !== 'production') return;

		for (const fileName in bundle) {
			const file = bundle[fileName];
			if (file.type === 'chunk' && file.code) {
				file.code = file.code.replace(
					/([?&])_t=([^&]+)/g,
					`$1_t=${Date.now()}`
				);
			}
		}
	}
});

export default defineConfig(({ command }) => ({
	base: command === 'build' ? baseUrl : '/',
	plugins: [
		react(),
		replace({
			"process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
			preventAssignment: true,
		}),
		{
			name: "html-transform",
			transformIndexHtml(html) {
				return html.replace("{{title}}", packageJson.name + " - " + packageJson.version);
			},
		},
		publicAssetTransform(),
		addTimestamp(),
	],
	build: {
		target: "es2020",
		outDir: "dist",
		minify: "esbuild",
		sourcemap: false,
		rollupOptions: {
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: '[name].js',
				assetFileNames: '[name].[ext]',
				manualChunks: {
					'vendor-react': ['react', 'react-dom'],
				},
			},
		},
	},
	css: {
		postcss: "./postcss.config.js",
	},
}));
