import type { Config } from "tailwindcss";
import colors from "./src/utils/colors";

const config: Config = {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				...colors,
			},
			boxShadow: {
				xs: "0 0 0 1px rgba(0, 0, 0, 0.16)",
				sm: "0 1px 2px 0 rgba(0, 0, 0, 0.16)",
				default:
					"0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
				md: "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
				lg: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
				xl: "0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
				"2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
				nav: "0px 2px 8px -2px rgba(24, 24, 24, 0.04), 0px 8px 12px -2px rgba(24, 24, 24, 0.1)",
				inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)",
				outline: "0 0 0 3px rgba(66, 153, 225, 0.5)",
				none: "none",
			},
			spacing: {
				"9/16": "56.25%",
				"3/4": "75%",
				"1/1": "100%",
			},
			fontFamily: {
				display: [
					'"ITC Avant Garde",system-ui,-apple-system,blinkmacsystemfont,"Segoe UI",roboto,"Helvetica Neue",arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
				],
				sans: [
					'"Salesforce Sans",system-ui,-apple-system,blinkmacsystemfont,"Segoe UI",roboto,"Helvetica Neue",arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
				],
			},
			fontSize: {
				xs: "0.75rem",
				sm: "0.875rem",
				base: "1rem",
				lg: "1.125rem",
				xl: "1.25rem",
				"2xl": "1.5rem",
				"3xl": "2rem",
				"4xl": "2.625rem",
				"5xl": "3.75rem",
				"6xl": "5.5rem",
				clamp: "clamp(3rem, 3.8vw, 2rem)",
				"display-1": [
					"5rem",
					{
						lineHeight: "5.5rem",
					},
				],
				"display-2": [
					"3.5rem",
					{
						lineHeight: "4rem",
					},
				],
				"display-3": [
					"3rem",
					{
						lineHeight: "3.5rem",
					},
				],
				"display-4": [
					"2.5rem",
					{
						lineHeight: "3rem",
					},
				],
				"display-5": [
					"2rem",
					{
						lineHeight: "2.5rem",
					},
				],
				"display-6": [
					"1.5rem",
					{
						lineHeight: "2rem",
					},
				],
				"display-7": [
					"1.25rem",
					{
						lineHeight: "1.75rem",
					},
				],
				"display-8": [
					"1rem",
					{
						lineHeight: "1.5rem",
					},
				],
			},
			inset: {
				"1/2": "50%",
				full: "100%",
			},
			letterSpacing: {
				tighter: "-0.02em",
				tight: "-0.01em",
				normal: "0",
				wide: "0.01em",
				wider: "0.02em",
				widest: "0.4em",
			},
			lineHeight: {
				none: "1",
				tighter: "1.125",
				tight: "1.25",
				snug: "1.375",
				normal: "1.5",
				relaxed: "1.625",
				loose: "2",
			},
			minWidth: {
				10: "2.5rem",
				48: "12rem",
			},
			opacity: {
				90: "0.9",
			},
			scale: {
				98: ".98",
			},
			keyframes: {
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-1%)" },
				},
				slideDownAndFade: {
					from: { opacity: "0", transform: "translateY(-12px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				slideLeftAndFade: {
					from: { opacity: "0", transform: "translateX(12px)" },
					to: { opacity: "1", transform: "translateX(0)" },
				},
				slideUpAndFade: {
					from: { opacity: "0", transform: "translateY(2px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				slideRightAndFade: {
					from: { opacity: "0", transform: "translateX(-12px)" },
					to: { opacity: "1", transform: "translateX(0)" },
				},
				overlayShow: {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				overlayHide: {
					from: { opacity: "1" },
					to: { opacity: "0" },
				},
				contentShow: {
					from: { opacity: "0", transform: "translate(-50%, -48%) scale(0.90)" },
					to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
				},
				contentHide: {
					from: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
					to: { opacity: "0", transform: "translate(-50%, -48%) scale(.90)" },
				},
			},
			animation: {
				float: "float 3s ease-in-out",
				zoom: "zoom scale(1.02)",
				slideDownAndFade:
					"slideDownAndFade 300ms cubic-bezier(0.16, 1, 0.3, 1)",
				slideLeftAndFade:
					"slideLeftAndFade 300ms cubic-bezier(0.16, 1, 0.3, 1)",
				slideUpAndFade: "slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				slideRightAndFade:
					"slideRightAndFade 300ms cubic-bezier(0.16, 1, 0.3, 1)",
				overlayShow: "overlayShow 250ms cubic-bezier(0.16, 1, 0.3, 1)",
				overlayHide: "overlayShow 250ms cubic-bezier(0.16, 1, 0.3, 1)",
				contentShow: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
				contentHide: "contentHide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
			},
			transitionTimingFunction: {
				"in-out": "cubic-bezier(0.2, 1, 0.25, 1)",
			},
		},
	},
	variants: {
		extend: {},
	},
};

export default config;
