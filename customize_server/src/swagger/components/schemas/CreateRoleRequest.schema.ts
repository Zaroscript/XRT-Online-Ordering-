export const CreateRoleRequest = {
        type: 'object',
        required: ['name', 'displayName'],
        properties: {
          name: { type: 'string', example: 'content-manager' },
          displayName: { type: 'string', example: 'Content Manager' },
          description: { type: 'string', example: 'Can manage content but not users' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['settings:read', 'orders:read', 'items:read'],
          },
        },
      };
