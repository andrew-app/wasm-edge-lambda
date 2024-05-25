import { verify, type JwtPayload } from "jsonwebtoken";

import type { CloudFrontRequestEvent, CloudFrontFunctionsEvent, CloudFrontRequestCallback, CloudFrontResponse, CloudFrontRequestResult } from "aws-lambda";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({region: 'ap-southeast-2'});

const parameterCommand = new GetParameterCommand({ Name: 'JWT_SECRET', WithDecryption: true });

interface CustomClaims extends JwtPayload {
    permissions?: string[];
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

export const handler = async (event: CloudFrontRequestEvent, _context: CloudFrontFunctionsEvent['context'], callback: CloudFrontRequestCallback) => {
    let authToken = '';

    const secret = (await ssmClient.send(parameterCommand)).Parameter?.Value || '';
    const request = event.Records[0].cf.request;
    const validPermissions = ['view:data'];
    let isValid = false;

    if (request.headers['authorization'])
        authToken = request.headers['authorization'][0].value.replace("Bearer ", "")

    try {
        const decodedToken = verify(authToken, secret) as CustomClaims;

        if (decodedToken.permissions) {
            isValid = validPermissions.every(permission => decodedToken.permissions?.includes(permission) ?? false);
        } else {
            throw new Error('No permissions found in token');
        }
    }

    catch(error) {
        response.status = '401';
        response.statusDescription = 'Unauthorized';
        response.body = JSON.stringify({error: 'Invalid token'});
        console.error(error);
        callback(null, response);
    }

    if (!isValid) {
        response.status = '403';
        response.statusDescription = 'Forbidden';
        callback(null, response);
    }

    callback(null, request);
}