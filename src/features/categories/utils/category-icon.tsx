import { CATEGORY_ICON_OPTIONS } from "@/features/categories/constants/category-icons";

const DEFAULT_ICON_OPTION = CATEGORY_ICON_OPTIONS[0];

export function getCategoryIconOption(iconName?: string | null) {
  return CATEGORY_ICON_OPTIONS.find((option) => option.value === iconName) ?? DEFAULT_ICON_OPTION;
}

export function getCategoryIcon(iconName?: string | null) {
  return getCategoryIconOption(iconName).icon;
}

export function getCategoryIconLabel(iconName?: string | null) {
  return getCategoryIconOption(iconName).label;
}
