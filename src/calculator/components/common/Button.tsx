import React from "react";

export const BUTTON_TYPES = {
	PRIMARY: "primary",
	SECONDARY: "secondary",
	LINK: "link",
} as const;

type ButtonType = (typeof BUTTON_TYPES)[keyof typeof BUTTON_TYPES];

interface ButtonProps {
	children: React.ReactNode;
	onClick: () => void;
	disabled?: boolean;
	buttonType?: ButtonType;
	className?: string;
	size?: "small" | "medium" | "large";
}

const Button: React.FC<ButtonProps> = ({
	children,
	onClick,
	disabled = false,
	buttonType = BUTTON_TYPES.PRIMARY,
	className,
	size = "medium",
}) => {
	const getButtonSize = (size: "small" | "medium" | "large") => {
		switch (size) {
			case "small":
				return "h-[32px] text-[14px]";
			case "medium":
				return "h-[52px] text-[16px]";
			case "large":
				return "h-[60px] text-[18px]";
		}
	};
	const buttonSize = getButtonSize(size);
	const getButtonStyles = (buttonType: ButtonType) => {
		switch (buttonType) {
			case BUTTON_TYPES.PRIMARY:
				return disabled
					? "bg-[#C9C9C9] cursor-not-allowed border-none text-white"
					: "bg-[#0176D3] hover:bg-[#032D60] cursor-pointer border-none text-white";
			case BUTTON_TYPES.SECONDARY:
				return disabled
					? "bg-[#FFFFFF] border-2 border-[#B0ADAB] px-6 py-3 text-[#B0ADAB] cursor-not-allowed opacity-50"
					: "bg-[#FFFFFF] hover:bg-[#EAF5F6] border-2 border-[#0176D3] hover:border-[#014486] px-6 py-3 text-[#0176D3] hover:text-[#014486] font-bold cursor-pointer";
			case BUTTON_TYPES.LINK:
				return disabled
					? "text-sm font-medium text-[#B0ADAB] underline cursor-not-allowed opacity-50 font-sans"
					: "text-sm font-bold text-[#0176D3] underline cursor-pointer font-sans";
		}
	};

	const buttonStyles = getButtonStyles(buttonType);

	const wrapperClass = `flex justify-center ${buttonSize} ${className ?? ""}`;
	const buttonClass = `${buttonStyles} ${className ?? ""}`;

	return (
		<div className={wrapperClass}>
			{buttonType === BUTTON_TYPES.LINK ? (
				<button onClick={onClick} disabled={disabled} className={buttonClass}>
					{children}
				</button>
			) : (
				<button
					type="button"
					onClick={onClick}
					disabled={disabled}
					className={`flex shrink-0 items-center justify-center gap-[10px] rounded-[4px] px-[32px] font-sans font-bold transition-all duration-200 ${buttonClass}`}
					style={{
						fontFeatureSettings: "'liga' off, 'clig' off",
					}}
				>
					<span>{children}</span>
				</button>
			)}
		</div>
	);
};

export default Button;
