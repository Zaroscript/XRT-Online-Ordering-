/**
 * Helper function to extract group ID from various formats (for modifier groups)
 */
export const getGroupId = (group: any): string | null => {
  if (!group) return null;
  if (typeof group === 'string') return group;
  if (typeof group === 'object') {
    // Try multiple possible ID fields
    return (
      group.id || group._id || group.value || group.modifier_group_id || null
    );
  }
  return String(group);
};

/**
 * Helper function to extract group ID from modifier's modifier_group_id field
 */
export const getGroupIdFromModifier = (modifierGroupId: any): string | null => {
  if (!modifierGroupId) return null;
  if (typeof modifierGroupId === 'string') return modifierGroupId;
  if (typeof modifierGroupId === 'object') {
    return String(
      modifierGroupId.id || modifierGroupId._id || modifierGroupId.value || '',
    );
  }
  return String(modifierGroupId);
};

/**
 * Helper function to extract modifier group ID from modifier object
 */
export const getModifierGroupId = (modifier: any): string | null => {
  if (!modifier) return null;

  // Try multiple possible ways to get the group ID
  // Handle direct modifier_group_id (string or ObjectId)
  if (modifier.modifier_group_id) {
    // If it's an ObjectId object, extract the string
    if (typeof modifier.modifier_group_id === 'object') {
      if (modifier.modifier_group_id._id) {
        return String(modifier.modifier_group_id._id);
      }
      if (modifier.modifier_group_id.toString) {
        return modifier.modifier_group_id.toString();
      }
      // Try to get id or _id from the object
      return String(
        modifier.modifier_group_id.id ||
          modifier.modifier_group_id._id ||
          modifier.modifier_group_id,
      );
    }
    return String(modifier.modifier_group_id);
  }

  // Handle nested modifier_group object
  if (modifier.modifier_group) {
    if (typeof modifier.modifier_group === 'string') {
      return modifier.modifier_group;
    }
    if (typeof modifier.modifier_group === 'object') {
      // Handle ObjectId or regular object
      if (modifier.modifier_group._id) {
        return String(modifier.modifier_group._id);
      }
      return String(
        modifier.modifier_group.id || modifier.modifier_group._id || '',
      );
    }
  }
  return null;
};
