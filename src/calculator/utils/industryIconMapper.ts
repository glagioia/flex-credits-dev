import { IndustryIconType } from "../components/icons/IndustryIcon";

/**
 * Maps an industry system name to its corresponding icon type.
 * This handles cases where the API doesn't provide an icon field
 * by inferring the icon from the industry name.
 */
export function mapIndustryToIconType(systemName: string): IndustryIconType {
  // Normalize the system name: lowercase and remove special characters
  const normalized = systemName.toLowerCase().replace(/[^a-z]/g, '');

  // Direct mapping based on systemName patterns
  const mappings: Record<string, IndustryIconType> = {
    'automotive': 'automotive',
    'communications': 'communications',
    'construction': 'construction',
    'constructionrealestate': 'construction',
    'consumergoods': 'consumer_goods',
    'education': 'education',
    'energy': 'energy',
    'energyutilities': 'energy',
    'financial': 'financial',
    'financialservices': 'financial',
    'healthcare': 'healthcare',
    'healthcarelifesciences': 'healthcare',
    'manufacturing': 'manufacturing',
    'media': 'media',
    'nonprofit': 'nonprofit',
    'professional': 'professional',
    'professionalservices': 'professional',
    'public': 'public',
    'publicsector': 'public',
    'retail': 'retail',
    'technology': 'technology',
    'travel': 'travel',
    'traveltransportationhospitality': 'travel',
    'transportation': 'travel',
    'hospitality': 'travel',
    'other': 'other',
  };

  return mappings[normalized] || 'other';
}

/**
 * Gets the icon type from an industry object.
 * First tries to use the icon field if provided,
 * otherwise falls back to mapping from the systemName.
 */
export function getIndustryIconType(industry: { systemName: string; icon?: string }): IndustryIconType {
  // If icon field is provided and not empty, use it
  if (industry.icon && industry.icon.trim() !== '') {
    return industry.icon as IndustryIconType;
  }

  // Otherwise, map from systemName
  return mapIndustryToIconType(industry.systemName);
}
