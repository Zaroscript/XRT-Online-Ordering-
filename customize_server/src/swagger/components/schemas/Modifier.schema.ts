export const Modifier = {
  type: 'object',
  required: ['name', 'modifier_group_id'],
  properties: {
    id: {
      type: 'string',
      example: '60d5ecb8b392d7001f8e8e8e',
      description: 'Unique identifier for the modifier',
    },
    modifier_group_id: {
      type: 'string',
      example: '60d5ecb8b392d7001f8e8e8e',
      description: 'ID of the modifier group this modifier belongs to',
    },
    name: {
      type: 'string',
      example: 'Extra Cheese',
      description: 'Name of the modifier',
    },
    display_order: {
      type: 'integer',
      minimum: 0,
      example: 1,
      description: 'Order for displaying this modifier within the group',
    },
    is_active: {
      type: 'boolean',
      example: true,
      description: 'Whether this modifier is active',
    },
    sides_config: {
      type: 'object',
      description:
        'Sides configuration for this modifier. Controls whether this modifier supports sides selection (LEFT, RIGHT, WHOLE)',
      properties: {
        enabled: {
          type: 'boolean',
          example: true,
          description: 'Whether sides are enabled for this modifier',
        },
        allowed_sides: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['LEFT', 'RIGHT', 'WHOLE'],
          },
          example: ['LEFT', 'RIGHT', 'WHOLE'],
          description: 'Array of allowed sides for this modifier. Valid values: LEFT, RIGHT, WHOLE',
        },
      },
    },
    quantity_levels: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/QuantityLevel',
      },
    },
    prices_by_size: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/PricesBySize',
      },
    },
    created_at: {
      type: 'string',
      format: 'date-time',
      example: '2023-12-01T10:30:00Z',
    },
    updated_at: {
      type: 'string',
      format: 'date-time',
      example: '2023-12-01T10:30:00Z',
    },
  },
};
