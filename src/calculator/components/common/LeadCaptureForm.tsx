import React, { useState } from 'react';
import CustomSelect, { type SelectOption } from './CustomSelect';
import { getText } from '../../../utils/textUtils';

const PRIVACY_URL = 'https://www.salesforce.com/company/privacy/';
const RECAPTCHA_PRIVACY_URL = 'https://policies.google.com/privacy';
const RECAPTCHA_TERMS_URL = 'https://policies.google.com/terms';

export const COUNTRY_OPTIONS: SelectOption[] = [
	{ id: 'US', label: 'United States' },
	{ id: 'CA', label: 'Canada' },
	{ id: 'MX', label: 'Mexico' },
	{ id: 'GB', label: 'United Kingdom' },
	{ id: 'DE', label: 'Germany' },
	{ id: 'FR', label: 'France' },
	{ id: 'AU', label: 'Australia' },
	{ id: 'BR', label: 'Brazil' },
	{ id: 'ES', label: 'Spain' },
	{ id: 'IN', label: 'India' },
	{ id: 'JP', label: 'Japan' },
	{ id: 'OTHER', label: 'Other' },
];

const PHONE_PREFIX_OPTIONS: { value: string; label: string }[] = [
	{ value: '+1', label: '+1' },
	{ value: '+44', label: '+44' },
	{ value: '+52', label: '+52' },
	{ value: '+49', label: '+49' },
	{ value: '+33', label: '+33' },
	{ value: '+34', label: '+34' },
	{ value: '+39', label: '+39' },
	{ value: '+55', label: '+55' },
	{ value: '+61', label: '+61' },
	{ value: '+81', label: '+81' },
	{ value: '+91', label: '+91' },
	{ value: '+86', label: '+86' },
	{ value: '+353', label: '+353' },
	{ value: '+31', label: '+31' },
	{ value: '+46', label: '+46' },
	{ value: '+41', label: '+41' },
	{ value: '+43', label: '+43' },
	{ value: '+48', label: '+48' },
	{ value: '+351', label: '+351' },
	{ value: '+7', label: '+7' },
];

export interface LeadCaptureFormData {
	firstName: string;
	lastName: string;
	jobTitle: string;
	email: string;
	phone: string;
	country: string;
	comments: string;
}

export interface LeadCaptureFormProps {
	formHeading: string;
	submitButtonText: string;
	submitButtonIcon?: React.ReactNode;
	onSubmit: (data: LeadCaptureFormData) => void;
	variant?: 'desktop' | 'mobile';
	/** Optional prefix for input ids to avoid collisions when multiple forms exist. */
	idPrefix?: string;
}

const inputBaseClass =
	'w-full h-[52px] px-4 rounded-lg border border-[#C9C9C9] bg-white text-base text-[#032D60] placeholder:text-gray-400 focus:outline-none focus:border-[#0176D3] focus:ring-2 focus:ring-[#0176D3]/20 transition-all';

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
	formHeading,
	submitButtonText,
	submitButtonIcon,
	onSubmit,
	variant = 'desktop',
	idPrefix = 'lead',
}) => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [jobTitle, setJobTitle] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [phonePrefix, setPhonePrefix] = useState('+1');
	const [country, setCountry] = useState<string | null>(null);
	const [comments, setComments] = useState('');
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const isMobile = variant === 'mobile';
	const id = (name: string) => `${idPrefix}-${name}`;

	const validate = (): boolean => {
		setTouched({
			firstName: true,
			lastName: true,
			jobTitle: true,
			email: true,
			country: true,
		});
		return !!(
			firstName.trim() &&
			lastName.trim() &&
			jobTitle.trim() &&
			email.trim() &&
			country
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;
		onSubmit({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			jobTitle: jobTitle.trim(),
			email: email.trim(),
			phone: phone.trim() ? `${phonePrefix}${phone.trim()}` : '',
			country: country || '',
			comments: comments.trim(),
		});
	};

	return (
		<div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 ${isMobile ? 'order-2' : ''}`}>
			<h2 className="text-xl font-bold text-[#032D60] mb-6">
				{formHeading}
			</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className={isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
					<div>
						<label htmlFor={id('firstName')} className="block text-sm font-medium text-[#032D60] mb-1">
							{getText("calc_first_name")}
						</label>
						<input
							id={id('firstName')}
							type="text"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							className={inputBaseClass}
							placeholder={getText("calc_first_name")}
							required
						/>
						{touched.firstName && !firstName.trim() && (
							<p className="text-red-600 text-xs mt-1">{getText("calc_required")}</p>
						)}
					</div>
					<div>
						<label htmlFor={id('lastName')} className="block text-sm font-medium text-[#032D60] mb-1">
							{getText("calc_last_name")}
						</label>
						<input
							id={id('lastName')}
							type="text"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							className={inputBaseClass}
							placeholder={getText("calc_last_name")}
							required
						/>
						{touched.lastName && !lastName.trim() && (
							<p className="text-red-600 text-xs mt-1">{getText("calc_required")}</p>
						)}
					</div>
				</div>
				<div className={isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
					<div>
						<label htmlFor={id('jobTitle')} className="block text-sm font-medium text-[#032D60] mb-1">
							{getText("calc_job_title")}
						</label>
						<input
							id={id('jobTitle')}
							type="text"
							value={jobTitle}
							onChange={(e) => setJobTitle(e.target.value)}
							className={inputBaseClass}
							placeholder={getText("calc_job_title")}
							required
						/>
						{touched.jobTitle && !jobTitle.trim() && (
							<p className="text-red-600 text-xs mt-1">{getText("calc_required")}</p>
						)}
					</div>
					<div>
						<label htmlFor={id('email')} className="block text-sm font-medium text-[#032D60] mb-1">
							{getText("calc_email")}
						</label>
						<input
							id={id('email')}
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className={inputBaseClass}
							placeholder={getText("calc_email")}
							required
						/>
						{touched.email && !email.trim() && (
							<p className="text-red-600 text-xs mt-1">{getText("calc_required")}</p>
						)}
					</div>
				</div>
				<div>
					<label htmlFor={id('phone')} className="block text-sm font-medium text-[#032D60] mb-1">
						{getText("calc_phone")}
					</label>
					<div className="flex border border-[#C9C9C9] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#0176D3]/20 focus-within:border-[#0176D3] bg-white">
						<div className="relative shrink-0" style={{ minWidth: 72 }}>
							<select
								aria-label={getText("calc_phone")}
								value={phonePrefix}
								onChange={(e) => setPhonePrefix(e.target.value)}
								className="h-[52px] w-full pl-3 pr-8 text-base text-[#032D60] bg-gray-50 border-r border-[#C9C9C9] focus:outline-none focus:ring-0 appearance-none cursor-pointer"
							>
								{PHONE_PREFIX_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
							<div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
								<svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-[#032D60]">
									<path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
						</div>
						<input
							id={id('phone')}
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="flex-1 h-[52px] px-4 text-base text-[#032D60] placeholder:text-gray-400 focus:outline-none min-w-0"
							placeholder={getText("calc_phone_placeholder")}
						/>
					</div>
				</div>
				<div>
					<label htmlFor={id('country')} className="block text-sm font-medium text-[#032D60] mb-1">
						{getText("calc_country_region")}
					</label>
					<CustomSelect
						options={COUNTRY_OPTIONS}
						value={country}
						onChange={(v) => setCountry(v)}
						placeholder={getText("calc_select_an_option")}
					/>
					{touched.country && !country && (
						<p className="text-red-600 text-xs mt-1">{getText("calc_required")}</p>
					)}
				</div>
				<div>
					<label htmlFor={id('comments')} className="block text-sm font-medium text-[#032D60] mb-1">
						{getText("calc_questions_comments")}
					</label>
					<textarea
						id={id('comments')}
						value={comments}
						onChange={(e) => setComments(e.target.value)}
						rows={3}
						className={`${inputBaseClass} h-auto py-3 resize-none`}
						placeholder={getText("calc_questions_comments")}
					/>
				</div>
				<p className="text-sm text-[#032D60]">
					{getText("calc_privacy_text")}
					<a
						href={PRIVACY_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#0176D3] underline hover:no-underline"
					>
						{getText("calc_privacy_statement")}
					</a>
					.
				</p>
				<div className="w-full">
					<button
						type="submit"
						className="flex shrink-0 items-center justify-center gap-2 w-full transition-all duration-100 h-[52px] px-8 rounded border-none cursor-pointer text-white font-bold text-base"
						style={{ background: '#0176D3' }}
					>
						{submitButtonText}
						{submitButtonIcon != null ? submitButtonIcon : null}
					</button>
				</div>
				<p className="text-xs text-gray-500 mt-4">
					{getText("calc_recaptcha_text")}
					<a href={RECAPTCHA_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="text-[#0176D3] underline">
						{getText("calc_privacy_policy")}
					</a>
					{getText("calc_recaptcha_and")}
					<a href={RECAPTCHA_TERMS_URL} target="_blank" rel="noopener noreferrer" className="text-[#0176D3] underline">
						{getText("calc_terms_of_service")}
					</a>
					{getText("calc_recaptcha_apply")}
				</p>
			</form>
		</div>
	);
};
