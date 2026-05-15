export const UpdatePermissionsRequest = {
        type: 'object',
        required: ['permissions'],
        properties: {
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['users:read', 'settings:update'],
          },
        },
      };
