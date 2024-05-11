import { verify } from 'rust-edge-lambda';

const response = {
    status: '200',
    statusDescription: 'OK',
    headers: {
        'content-type': [{
            key: 'Content-Type',
            value: 'application/json'
        }]
    }
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

    if (!isValidToken) {
        response.status = '401';
        response.statusDescription = 'Unauthorized';
        response.body = {
            error: 'Invalid token'
        }
    }

    callback(null, response);
}