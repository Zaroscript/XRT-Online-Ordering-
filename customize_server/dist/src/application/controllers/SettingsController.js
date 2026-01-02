"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
class SettingsController {
    constructor() {
        // Get settings - returns default settings structure
        this.getSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { language } = req.query;
            // Return default settings structure that matches frontend expectations
            const defaultSettings = {
                id: '1',
                options: {
                    siteTitle: 'XRT Online Ordering',
                    siteSubtitle: 'Enterprise Ordering System',
                    currency: 'USD',
                    useOtp: false,
                    useAi: false,
                    guestCheckout: true,
                    freeShipping: false,
                    freeShippingAmount: 0,
                    minimumOrderAmount: 0,
                    currencyToWalletRatio: 1,
                    signupPoints: 0,
                    maxShopDistance: 10,
                    maximumQuestionLimit: 5,
                    isProductReview: true,
                    enableTerms: false,
                    enableCoupons: true,
                    enableEmailForDigitalProduct: false,
                    useGoogleMap: true,
                    isPromoPopUp: false,
                    reviewSystem: 'default',
                    footer_text: '',
                    isUnderMaintenance: false,
                    maintenance: {
                        isEnable: false,
                        image: null,
                        title: '',
                        description: '',
                        start: null,
                        until: null,
                        isOverlayColor: false,
                        overlayColor: '',
                        overlayColorRange: '',
                        buttonTitleOne: '',
                        buttonTitleTwo: '',
                        newsLetterTitle: '',
                        newsLetterDescription: '',
                        aboutUsTitle: '',
                        contactUsTitle: '',
                    },
                    promoPopup: {
                        isEnable: false,
                        image: null,
                        title: '',
                        description: '',
                        popupDelay: 0,
                        popupExpiredIn: 0,
                        isNotShowAgain: false,
                    },
                    contactDetails: {
                        location: null,
                        contact: '',
                        contacts: [],
                        website: '',
                        socials: [],
                    },
                    logo: null,
                    collapseLogo: null,
                    taxClass: null,
                    shippingClass: null,
                    seo: {
                        metaTitle: '',
                        metaDescription: '',
                        ogTitle: '',
                        ogDescription: '',
                        ogImage: null,
                        twitterHandle: '',
                        twitterCardType: '',
                        metaTags: '',
                        canonicalUrl: '',
                    },
                    google: {
                        isEnable: false,
                        tagManagerId: '',
                    },
                    facebook: {
                        isEnable: false,
                        appId: '',
                        pageId: '',
                    },
                    currencyOptions: {
                        formation: 'en-US',
                        fractions: 2,
                    },
                    messages: {
                        closed_message: '',
                        not_accepting_orders_message: '',
                    },
                    orders: {
                        accept_orders: true,
                        allowScheduleOrder: false,
                        maxDays: 30,
                        deliveredOrderTime: 30,
                    },
                    operating_hours: {
                        auto_close: false,
                        schedule: [
                            { day: 'Monday', open_time: '09:00', close_time: '17:00', is_closed: false },
                            { day: 'Tuesday', open_time: '09:00', close_time: '17:00', is_closed: false },
                            { day: 'Wednesday', open_time: '09:00', close_time: '17:00', is_closed: false },
                            { day: 'Thursday', open_time: '09:00', close_time: '17:00', is_closed: false },
                            { day: 'Friday', open_time: '09:00', close_time: '17:00', is_closed: false },
                            { day: 'Saturday', open_time: '10:00', close_time: '16:00', is_closed: false },
                            { day: 'Sunday', open_time: '10:00', close_time: '16:00', is_closed: false },
                        ],
                    },
                    delivery: {
                        enabled: true,
                        radius: 10,
                        fee: 5,
                        min_order: 0,
                    },
                    fees: {
                        service_fee: 0,
                        tip_options: [5, 10, 15, 20],
                    },
                    taxes: {
                        sales_tax: 0,
                    },
                    timezone: 'America/New_York',
                    server_info: {
                        phpVersion: null,
                        phpMaxExecutionTime: null,
                        phpMaxInputVars: null,
                        maxUploadSize: null,
                        upload_max_filesize: null,
                    },
                    heroSlides: [],
                },
                language: language || 'en',
                translated_languages: ['en'],
            };
            return (0, response_1.sendSuccess)(res, 'Settings retrieved successfully', defaultSettings);
        });
        // Update settings
        this.updateSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // For now, just return success - actual implementation would save to database
            // This can be extended to use BusinessSettings repository when needed
            return (0, response_1.sendSuccess)(res, 'Settings updated successfully', {
                id: '1',
                options: req.body,
            });
        });
    }
}
exports.SettingsController = SettingsController;
