import React from 'react';
import { Agentforce } from '@sfdc/eaas/sdk';
import { CustomSelect, NumberInput, InputRow } from './index';
import { getText } from '../../../utils/textUtils';
import { formatCreditsShort, formatPriceShort } from '../../utils/estimationFormatters';

export interface EmployeeConfigValues {
  skuId: string | null;
  seats: number;
}

interface EmployeeTemplateConfigProps {
  template: Agentforce.Template;
  skuOptions: Agentforce.GatingSku[];
  values: EmployeeConfigValues;
  onChange: (templateId: string, values: EmployeeConfigValues) => void | Promise<void>;
  /** Calculated seats from SDK */
  totalSeats?: number;
  /** Calculated pricing from SDK */
  totalPricing?: number;
  /** Whether to render for mobile layout */
  isMobile?: boolean;
}

const EmployeeTemplateConfig: React.FC<EmployeeTemplateConfigProps> = ({
  template,
  skuOptions,
  values,
  onChange,
  totalSeats = 0,
  totalPricing = 0,
  isMobile = false,
}) => {
  const handleSkuChange = (skuId: string) => {
    onChange(template.id, { ...values, skuId });
  };

  const handleSeatsChange = (seats: number) => {
    onChange(template.id, { ...values, seats });
  };

  const selectOptions = skuOptions.map((sku) => ({
    id: sku.id,
    label: sku.displayName,
  }));

  const licenseDescription = `${getText("calc_employee_template_license_description_line1")}\n${getText("calc_employee_template_license_description_line2")}`;

  // Mobile layout
  if (isMobile) {
    return (
			<div className="mb-6 overflow-hidden rounded-[16px] border border-[#D8E6F1]">
				{/* Header */}
				<div className="bg-[#00B3FF] px-6 py-5">
					<h3
						className="text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
					>
						{template.displayName}
					</h3>
					<p
						className="mt-1 text-[14px] leading-[20px] text-[#444444] font-sans"
					>
						{getText("calc_configure_use_case_subtitle")}
					</p>
					{/* Stats row */}
					<div className="mt-4 flex items-center justify-between border-t border-[#032D60]/20 px-8 pt-4">
						<div className="text-center">
							<div
								className="text-[20px] font-bold leading-[28px] text-[#032D60 font-sans"
							>
								{formatCreditsShort(totalSeats)}
							</div>
							<div
								className="text-[12px] leading-[16px] text-[#444444] font-sans"
							>
								{getText("calc_configure_use_case_seats")}
							</div>
						</div>
						<div className="text-center">
							<div
								className="text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
							>
								$ {formatPriceShort(totalPricing)}
							</div>
							<div
								className="text-[12px] leading-[16px] text-[#444444] font-sans"
							>
								{getText("calc_configure_use_case_pricing")}
							</div>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="bg-white px-6">
					{/* SKU Select Input */}
					<InputRow
						label={getText("calc_employee_template_license_label")}
						tooltip={licenseDescription}
						description={licenseDescription}
						isMobile={true}
						hideBorder={true}
					>
						<CustomSelect
							options={selectOptions}
							value={values.skuId}
							onChange={handleSkuChange}
							placeholder={getText("calc_employee_template_license_placeholder")}
						/>
					</InputRow>

					{/* Seats Number Input */}
					<InputRow
						label={getText("calc_employee_template_seats_label")}
						tooltip={getText("calc_employee_template_seats_label")}
						isMobile={true}
					>
						<NumberInput value={values.seats} onChange={handleSeatsChange} />
					</InputRow>
				</div>

				{/* Footer - Small bar only */}
				<div className="h-3 rounded-b-[16px] bg-[#00B3FF]" />
			</div>
		);
  }

  // Desktop layout
  return (
    <div className="mb-6 overflow-hidden rounded-[16px] border border-[#D8E6F1]">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#00B3FF] px-6 py-5">
        <div>
          <h3
            className="text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
          >
            {template.displayName}
          </h3>
          <p
            className="mt-1 text-[14px] leading-[20px] text-[#444444] font-sans"
          >
            {getText("calc_configure_use_case_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-10">
          <div className="text-center">
            <div
              className="text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
            >
              {formatCreditsShort(totalSeats)}
            </div>
            <div
              className="text-[12px] leading-[16px] text-[#444444] font-sans"
            >
              {getText("calc_configure_use_case_seats")}
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
            >
              $ {formatPriceShort(totalPricing)}
            </div>
            <div
              className="text-[12px] leading-[16px] text-[#444444] font-sans"
            >
              {getText("calc_configure_use_case_pricing")}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white px-6">
        {/* SKU Select Input */}
        <InputRow
          label={getText("calc_employee_template_license_label")}
          tooltip={licenseDescription}
          description={licenseDescription}
          isMobile={false}
          hideBorder={true}
        >
          <CustomSelect
            options={selectOptions}
            value={values.skuId}
            onChange={handleSkuChange}
            placeholder={getText("calc_employee_template_license_placeholder")}
          />
        </InputRow>

        {/* Seats Number Input */}
        <InputRow
          label={getText("calc_employee_template_seats_label")}
          tooltip={getText("calc_employee_template_seats_label")}
          isMobile={false}
        >
          <NumberInput
            value={values.seats}
            onChange={handleSeatsChange}
          />
        </InputRow>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-[#00B3FF] px-6 py-5">
        <h4
          className="text-[18px] font-bold leading-[26px] text-[#032D60] font-sans"
        >
          {getText("calc_configure_use_case_total")}
        </h4>
        <div className="flex items-center gap-10">
          <div className="text-center">
            <div
              className="text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
            >
              {formatCreditsShort(totalSeats)}
            </div>
            <div
              className="text-[12px] leading-[16px] text-[#444444] font-sans"
            >
              {getText("calc_configure_use_case_seats")}
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
            >
              $ {formatPriceShort(totalPricing)}
            </div>
            <div
              className="text-[12px] leading-[16px] text-[#444444] font-sans"
            >
              {getText("calc_configure_use_case_pricing")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTemplateConfig;
