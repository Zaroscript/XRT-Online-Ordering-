"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../../shared/config/env");
class EmailService {
    createTransport() {
        if (env_1.env.NODE_ENV === 'production') {
            return nodemailer_1.default.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                },
            });
        }
        // Development: Mailtrap or similar
        return nodemailer_1.default.createTransport({
            host: env_1.env.EMAIL_HOST,
            port: parseInt(env_1.env.EMAIL_PORT || '587'),
            auth: {
                user: env_1.env.EMAIL_USERNAME,
                pass: env_1.env.EMAIL_PASSWORD,
            },
        });
    }
    async sendEmail(options) {
        const transporter = this.createTransport();
        const mailOptions = {
            from: `"${env_1.env.EMAIL_FROM_NAME}" <${env_1.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };
        await transporter.sendMail(mailOptions);
    }
}
exports.EmailService = EmailService;
