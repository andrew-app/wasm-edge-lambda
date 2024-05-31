import { auth_handler } from 'rust-edge-lambda';

export const handler = (event, _context, callback) => {
    auth_handler(event, callback);
}