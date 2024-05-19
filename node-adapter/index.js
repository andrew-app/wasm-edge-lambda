import { verify } from 'rust-edge-lambda';

const response = {
    status: '200',
    statusDescription: 'OK',
    headers: {
        'cache-control': [{
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0'
        }],
        'content-type': [{
            key: 'Content-Type',
            value: 'application/json'
        }]
    },
    bodyEncoding: 'text',
};

export const handler = async (event, _context, callback) => {
    let authToken = '';
    const request = event.Records[0].cf.request;
    let isValidToken = false;

    if (request.headers['authorization'])
        authToken = request.headers['authorization'][0].value.replace("Bearer ", "")

    try {
        isValidToken = verify(authToken);
    }

    catch(error) {
        console.error(error);
    }

    if (isValidToken === false) {
        response.status = '401';
        response.statusDescription = 'Unauthorized';
        response.body = JSON.stringify({ error: 'Invalid token' });
    }

    callback(null, response);
}