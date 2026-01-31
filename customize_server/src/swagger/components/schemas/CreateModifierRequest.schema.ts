export const CreateModifierRequestSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'Extra Cheese',
    },
    display_order: {
      type: 'integer',
      example: 0,
    },
    is_active: {
      type: 'boolean',
      example: true,
    },
    sides_config: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        allowed_sides: {
          type: 'array',
          items: { type: 'string', enum: ['LEFT', 'RIGHT', 'WHOLE'] },
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
  },
  required: ['name'],
};
