import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';

class MockController {
    getNotifyLogs = (req: Request, res: Response) => {
        return sendSuccess(res, 'Notify logs retrieved successfully', {
            data: [],
            current_page: 1,
            first_page_url: "http://localhost:3001/api/v1/notify-logs?page=1",
            from: 1,
            last_page: 1,
            last_page_url: "http://localhost:3001/api/v1/notify-logs?page=1",
            links: [],
            next_page_url: null,
            path: "http://localhost:3001/api/v1/notify-logs",
            per_page: 15,
            prev_page_url: null,
            to: 1,
            total: 0
        });
    };

    getConversations = (req: Request, res: Response) => {
        return sendSuccess(res, 'Conversations retrieved successfully', {
            data: [],
            current_page: 1,
            first_page_url: "http://localhost:3001/api/v1/conversations?page=1",
            from: 1,
            last_page: 1,
            last_page_url: "http://localhost:3001/api/v1/conversations?page=1",
            links: [],
            next_page_url: null,
            path: "http://localhost:3001/api/v1/conversations",
            per_page: 15,
            prev_page_url: null,
            to: 1,
            total: 0
        });
    };

    getAuthors = (req: Request, res: Response) => {
        return sendSuccess(res, 'Authors retrieved successfully', {
            data: [],
            current_page: 1,
            first_page_url: "http://localhost:3001/api/v1/authors?page=1",
            from: 1,
            last_page: 1,
            last_page_url: "http://localhost:3001/api/v1/authors?page=1",
            links: [],
            next_page_url: null,
            path: "http://localhost:3001/api/v1/authors",
            per_page: 15,
            prev_page_url: null,
            to: 1,
            total: 0
        });
    };

    getManufacturers = (req: Request, res: Response) => {
        return sendSuccess(res, 'Manufacturers retrieved successfully', {
            data: [],
            current_page: 1,
            first_page_url: "http://localhost:3001/api/v1/manufacturers?page=1",
            from: 1,
            last_page: 1,
            last_page_url: "http://localhost:3001/api/v1/manufacturers?page=1",
            links: [],
            next_page_url: null,
            path: "http://localhost:3001/api/v1/manufacturers",
            per_page: 15,
            prev_page_url: null,
            to: 1,
            total: 0
        });
    };
}

export default new MockController();
