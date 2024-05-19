import { verify } from 'rust-edge-lambda';

const response = {
    status: '204',
    statusDescription: 'No Content',
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
    body: ''
};

export const handler = async (event, _context, callback) => {
    let authToken = '';
    const request = event.Records[0].cf.request;

    if (request.headers['authorization'])
        authToken = request.headers['authorization'][0].value.replace("Bearer ", "")

    try {
        const verifyTokenResponse = verify(authToken);
        switch (verifyTokenResponse) {
            case '401':
                response.status = '401';
                response.statusDescription = 'Unauthorized';
                response.body = JSON.stringify({ error: 'Invalid token' });
                break;
            case '403':
                response.status = '403';
                response.statusDescription = 'Forbidden';
                break;
            case '200':
                callback(null, request);
            default:
                break;
        }
    }

    catch(error) {
        console.error(error);
        response.status = '401';
        response.statusDescription = 'Unauthorized';
        response.body = JSON.stringify({ error: 'Invalid token' });
    }

    callback(null, response);
}