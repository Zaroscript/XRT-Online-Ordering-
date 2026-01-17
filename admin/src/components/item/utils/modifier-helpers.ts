import {
  getGroupIdFromModifier,
  getGroupId,
  getModifierGroupId,
} from './item-form-utils';

// Size-related keywords to filter out (in group names)
export const SIZE_KEYWORDS = [
  'size',
  'sizes',
  'portion',
  'portions',
  'dimension',
  'dimensions',
];

// Common size-related modifier names (Small, Medium, Large, etc.)
export const SIZE_MODIFIER_NAMES = [
  'small',
  'medium',
  'large',
  'extra large',
  'xl',
  'xxl',
  'xs',
  'tiny',
  'huge',
];

/**
 * Filter out modifier groups that look like size groups
 */
export const filterSizeRelatedGroups = (modifierGroupsRaw: any[]): any[] => {
  if (!modifierGroupsRaw || !Array.isArray(modifierGroupsRaw)) return [];

  return modifierGroupsRaw.filter((group: any) => {
    // Ensure it's a modifier group, not a size
    // Modifier groups have display_type (RADIO/CHECKBOX), sizes have code
    const hasDisplayType =
      group.display_type === 'RADIO' || group.display_type === 'CHECKBOX';
    const hasCode = group.code !== undefined;
    const hasModifierGroupFields =
      group.min_select !== undefined || group.max_select !== undefined;

    // If it has a code field, it's likely a size, not a modifier group
    if (hasCode) return false;

    // Check if the group name suggests it's a size group
    const groupName = (group.name || '').toLowerCase().trim();
    const isSizeGroupByName = SIZE_KEYWORDS.some((keyword) =>
      groupName.includes(keyword),
    );

    // Check if the group contains modifiers that are actually sizes
    let isSizeGroupByModifiers = false;
    if (
      group.modifiers &&
      Array.isArray(group.modifiers) &&
      group.modifiers.length > 0
    ) {
      // Check if all modifiers in the group are size-related
      const allModifiersAreSizes = group.modifiers.every((modifier: any) => {
        const modifierName = (modifier.name || '').toLowerCase().trim();
        return SIZE_MODIFIER_NAMES.some(
          (sizeName) =>
            modifierName === sizeName || modifierName.includes(sizeName),
        );
      });

      if (allModifiersAreSizes && group.modifiers.length >= 2) {
        isSizeGroupByModifiers = true;
      }
    }

    const isSizeGroup = isSizeGroupByName || isSizeGroupByModifiers;

    if (isSizeGroup) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '🚫 Filtered out size-related modifier group:',
          group.name,
          {
            byName: isSizeGroupByName,
            byModifiers: isSizeGroupByModifiers,
            modifiers: group.modifiers?.map((m: any) => m.name),
          },
        );
      }
      return false;
    }

    // If it has display_type, it's definitely a modifier group (unless it's a size group)
    if (hasDisplayType && !isSizeGroup) return true;

    // If it has modifier group fields (min_select/max_select), it's likely a modifier group
    if (hasModifierGroupFields && !isSizeGroup) return true;

    // Default: include if it doesn't look like a size
    return !hasCode && !isSizeGroup;
  });
};

/**
 * Enhanced filtering that also checks modifiers to identify size groups
 */
export const filterGroupsByModifiers = (
  modifierGroups: any[],
  allModifiersList: any[],
): any[] => {
  if (!modifierGroups || !Array.isArray(modifierGroups)) return [];
  if (
    !allModifiersList ||
    !Array.isArray(allModifiersList) ||
    allModifiersList.length === 0
  )
    return modifierGroups;

  // Group modifiers by modifier_group_id to check which groups contain sizes
  const modifiersByGroupId = new Map<string, any[]>();
  allModifiersList.forEach((modifier: any) => {
    const groupId = getGroupIdFromModifier(
      modifier.modifier_group_id ||
        modifier.modifier_group?.id ||
        modifier.modifier_group?._id,
    );
    if (groupId) {
      if (!modifiersByGroupId.has(groupId)) {
        modifiersByGroupId.set(groupId, []);
      }
      modifiersByGroupId.get(groupId)!.push(modifier);
    }
  });

  // Filter out groups that contain only size-related modifiers
  return modifierGroups.filter((group: any) => {
    const groupId = getGroupIdFromModifier(group.id);
    const groupModifiers = groupId ? modifiersByGroupId.get(groupId) || [] : [];

    // If the group has modifiers, check if they're all sizes
    if (groupModifiers.length > 0) {
      const allModifiersAreSizes = groupModifiers.every((modifier: any) => {
        const modifierName = (modifier.name || '').toLowerCase().trim();
        return SIZE_MODIFIER_NAMES.some(
          (sizeName) =>
            modifierName === sizeName ||
            modifierName.includes(sizeName) ||
            modifierName.startsWith(sizeName + ' ') ||
            modifierName.endsWith(' ' + sizeName),
        );
      });

      if (allModifiersAreSizes && groupModifiers.length >= 2) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '🚫 Filtered out size-related modifier group (by modifiers):',
            group.name,
            {
              modifiers: groupModifiers.map((m: any) => m.name),
            },
          );
        }
        return false;
      }
    }

    return true;
  });
};

/**
 * Filter modifiers based on selected groups
 */
export const filterRelevantModifiers = (
  allModifiersList: any[],
  selectedModifierGroups: any[],
): any[] => {
  if (
    !allModifiersList ||
    !Array.isArray(allModifiersList) ||
    allModifiersList.length === 0
  ) {
    return [];
  }
  if (
    !selectedModifierGroups ||
    !Array.isArray(selectedModifierGroups) ||
    selectedModifierGroups.length === 0
  ) {
    return [];
  }

  // Extract all selected group IDs
  const selectedGroupIds = selectedModifierGroups
    .map(getGroupId)
    .filter((id): id is string => id !== null);

  if (selectedGroupIds.length === 0) {
    return [];
  }

  // Filter modifiers that belong to any of the selected groups
  return allModifiersList.filter((m: any) => {
    if (!m) return false;

    // Use helper function to get modifier group ID
    const modifierGroupId = getModifierGroupId(m);

    if (!modifierGroupId) {
      return false;
    }

    // Compare as strings to handle type mismatches
    return selectedGroupIds.some((groupId) => {
      return String(modifierGroupId).trim() === String(groupId).trim();
    });
  });
};
