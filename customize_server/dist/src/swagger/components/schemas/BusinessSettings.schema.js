"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSettings = void 0;
exports.BusinessSettings = {
    type: 'object',
    properties: {
        business: { type: 'string', description: 'Business ID' },
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
        currencyOptions: {
            type: 'object',
            properties: {
                formation: { type: 'string', example: 'en-US' },
                fractions: { type: 'number', example: 2 },
            },
        },
        google: {
            type: 'object',
            properties: {
                isEnable: { type: 'boolean', example: false },
                tagManagerId: { type: 'string' },
            },
        },
        facebook: {
            type: 'object',
            properties: {
                isEnable: { type: 'boolean', example: false },
                appId: { type: 'string' },
                pageId: { type: 'string' },
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
        heroSlides: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    bgImage: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            original: { type: 'string' },
                            thumbnail: { type: 'string' },
                        },
                    },
                    title: { type: 'string' },
                    subtitle: { type: 'string' },
                    btnText: { type: 'string' },
                    btnLink: { type: 'string' },
                },
            },
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
        isUnderMaintenance: { type: 'boolean', default: false },
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
                title: { type: 'string', default: '' },
                description: { type: 'string', default: '' },
                start: { type: 'string', format: 'date-time' },
                until: { type: 'string', format: 'date-time' },
                isOverlayColor: { type: 'boolean', default: false },
                overlayColor: { type: 'string', default: '' },
                overlayColorRange: { type: 'string', default: '' },
                buttonTitleOne: { type: 'string', default: '' },
                buttonTitleTwo: { type: 'string', default: '' },
                newsLetterTitle: { type: 'string', default: '' },
                newsLetterDescription: { type: 'string', default: '' },
                aboutUsTitle: { type: 'string', default: '' },
                aboutUsDescription: { type: 'string', default: '' },
                contactUsTitle: { type: 'string', default: '' },
            },
        },
        promoPopup: {
            type: 'object',
            properties: {
                isEnable: { type: 'boolean', default: false },
                image: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        original: { type: 'string' },
                        thumbnail: { type: 'string' },
                    },
                },
                title: { type: 'string', default: '' },
                description: { type: 'string', default: '' },
                popupDelay: { type: 'number', default: 0 },
                popupExpiredIn: { type: 'number', default: 0 },
                isNotShowAgain: { type: 'boolean', default: false },
            },
        },
    },
};
