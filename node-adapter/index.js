import { auth_handler } from 'rust-edge-lambda';

const response = {
    status: '204',
    statusDescription: 'No Content',
    headers: {
        'content-type': [{
            key: 'Content-Type',
            value: 'application/json'
        }]
    },
    bodyEncoding: 'text',
    body: ''
};

export const handler = async (event, _context, callback) => {
    const isAuth = await auth_handler(event);

    if (isAuth === true) {
        callback(null, event.Records[0].cf.request);
    }

    else {
        response.status = '401';
        response.statusDescription = 'Unauthorized';
        response.body = JSON.stringify({ error: 'Invalid token' });
    }

    callback(null, response);
}