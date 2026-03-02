import React from 'react';

interface TogglerProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  /** ID of the element that labels this input (for accessibility) */
  'aria-labelledby'?: string;
  /** ID of the element that describes this input (for accessibility) */
  'aria-describedby'?: string;
}

const Toggler: React.FC<TogglerProps> = ({
  value,
  onChange,
  disabled = false,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  return (
		<button
			type="button"
			role="switch"
			aria-checked={value}
			aria-labelledby={ariaLabelledBy}
			aria-describedby={ariaDescribedBy}
			onClick={() => !disabled && onChange(!value)}
			disabled={disabled}
			className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
				disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
			} ${value ? "bg-[#0176D3]" : "bg-gray-300"}`}
		>
			<span
				className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
					value ? "translate-x-5" : "translate-x-0.5"
				}`}
			/>
		</button>
	);
};

export default Toggler;
