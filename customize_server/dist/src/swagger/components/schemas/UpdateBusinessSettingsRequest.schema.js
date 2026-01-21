"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBusinessSettingsRequest = void 0;
exports.UpdateBusinessSettingsRequest = {
    type: 'object',
    properties: {
        operating_hours: {
            type: 'object',
            properties: {
                auto_close: { type: 'boolean' },
                schedule: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            day: { type: 'string' },
                            open_time: { type: 'string' },
                            close_time: { type: 'string' },
                            is_closed: { type: 'boolean' },
                        },
                    },
                },
            },
        },
        delivery: {
            type: 'object',
            properties: {
                enabled: { type: 'boolean' },
                radius: { type: 'number', description: 'Delivery radius in miles' },
                fee: { type: 'number' },
                min_order: { type: 'number' },
            },
        },
        fees: {
            type: 'object',
            properties: {
                service_fee: { type: 'number' },
                tip: { type: 'number' },
                tip_type: { type: 'string', enum: ['fixed', 'percentage'] },
            },
        },
        taxes: {
            type: 'object',
            properties: {
                sales_tax: { type: 'number' },
            },
        },
        orders: {
            properties: {
                accept_orders: { type: 'boolean' },
                allowScheduleOrder: { type: 'boolean' },
                maxDays: { type: 'number' },
                deliveredOrderTime: { type: 'number' },
            },
        },
        siteTitle: { type: 'string' },
        siteSubtitle: { type: 'string' },
        currency: { type: 'string' },
        seo: {
            type: 'object',
            properties: {
                metaTitle: { type: 'string' },
                metaDescription: { type: 'string' },
                ogTitle: { type: 'string' },
                ogDescription: { type: 'string' },
                ogImage: { type: 'object' },
                twitterHandle: { type: 'string' },
                twitterCardType: { type: 'string' },
                metaTags: { type: 'string' },
                canonicalUrl: { type: 'string' },
            },
        },
        logo: { type: 'object' },
        contactDetails: {
            type: 'object',
            properties: {
                location: { type: 'object' },
                contact: { type: 'string' },
                contacts: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
                website: { type: 'string' },
                socials: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            icon: { type: 'string' },
                            url: { type: 'string' }
                        }
                    }
                }
            }
        },
        // header_info removed
        footer_text: { type: 'string' },
        messages: {
            type: 'object',
            properties: {
                closed_message: { type: 'string' },
                not_accepting_orders_message: { type: 'string' },
            },
        },
        isUnderMaintenance: { type: 'boolean' },
        maintenance: {
            type: 'object',
            properties: {
                image: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        original: { type: 'string' },
                        thumbnail: { type: 'string' },
                    },
                },
                title: { type: 'string' },
                description: { type: 'string' },
                start: { type: 'string', format: 'date-time' },
                until: { type: 'string', format: 'date-time' },
                isOverlayColor: { type: 'boolean' },
                overlayColor: { type: 'string' },
                overlayColorRange: { type: 'string' },
                buttonTitleOne: { type: 'string' },
                buttonTitleTwo: { type: 'string' },
                newsLetterTitle: { type: 'string' },
                newsLetterDescription: { type: 'string' },
                aboutUsTitle: { type: 'string' },
                aboutUsDescription: { type: 'string' },
                contactUsTitle: { type: 'string' },
            },
        },
        promoPopup: {
            type: 'object',
            properties: {
                isEnable: { type: 'boolean' },
                image: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        original: { type: 'string' },
                        thumbnail: { type: 'string' },
                    },
                },
                title: { type: 'string' },
                description: { type: 'string' },
                popupDelay: { type: 'number' },
                popupExpiredIn: { type: 'number' },
                isNotShowAgain: { type: 'boolean' },
            },
        },
    },
};
