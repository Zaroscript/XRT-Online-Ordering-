import { HttpClient, getFormErrors, getFieldErrors } from './http-client';

// Export convenience functions
export const get = HttpClient.get.bind(HttpClient);
export const post = HttpClient.post.bind(HttpClient);
export const put = HttpClient.put.bind(HttpClient);
export const patch = HttpClient.patch.bind(HttpClient);
export const del = HttpClient.delete.bind(HttpClient);

export { getFormErrors, getFieldErrors };
