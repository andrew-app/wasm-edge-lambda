import { verify, type JwtPayload } from "jsonwebtoken";

import type { CloudFrontRequestEvent, CloudFrontFunctionsEvent, CloudFrontRequestCallback, CloudFrontResponse, CloudFrontRequestResult } from "aws-lambda";

interface CustomClaims extends JwtPayload {
    permissions?: string[];
}
declare module "bun" {
    interface Env {
      JWT_SECRET: string;
    }
}

const response: CloudFrontRequestResult = {
    status: '',
    statusDescription: '',
    headers: {
        'content-type': [{
            key: 'Content-Type',
            value: 'application/json'
        }]
    },
    bodyEncoding: 'text',
    body: ''
};

export const handler = (event: CloudFrontRequestEvent, _context: CloudFrontFunctionsEvent['context'], callback: CloudFrontRequestCallback) => {
    let authToken = '';

    const secret = process.env.JWT_SECRET;
    const request = event.Records[0].cf.request;
    const validPermissions = ['view:data'];
    let isAuthorised = false;

    if (request.headers['authorization'])
        authToken = request.headers['authorization'][0].value.replace("Bearer ", "")

    try {
        const decodedToken = verify(authToken, secret) as CustomClaims;

        if (decodedToken.permissions) {
            isAuthorised = validPermissions.every(permission => decodedToken.permissions?.includes(permission) ?? false);
        } else {
            throw new Error('No permissions found in custom claims');
        }
    }

    catch(error) {
        response.status = '401';
        response.statusDescription = 'Unauthorized';
        response.body = JSON.stringify({error: 'Invalid token'});
        console.error(error);
        callback(null, response);
    }

    if (!isAuthorised) {
        response.status = '403';
        response.statusDescription = 'Forbidden';
        callback(null, response);
    }

    callback(null, request);
}