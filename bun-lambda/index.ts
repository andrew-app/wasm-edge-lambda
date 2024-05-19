import { decode, verify } from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import type { CloudFrontRequestEvent, CloudFrontFunctionsEvent, CloudFrontRequestCallback, CloudFrontResponse, CloudFrontRequestResult } from "aws-lambda";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({region: 'ap-southeast-2'});

const parameterCommand = new GetParameterCommand({ Name: 'JWT_SECRET', WithDecryption: true });


export const handler = async (event: CloudFrontRequestEvent, _context: CloudFrontFunctionsEvent['context'], callback: CloudFrontRequestCallback) => {
    let authToken = '';
    const response: CloudFrontRequestResult = {
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

    const secret = (await ssmClient.send(parameterCommand)).Parameter?.Value || '';
    const request = event.Records[0].cf.request;

    if (request.headers['authorization'])
        authToken = request.headers['authorization'][0].value.replace("Bearer ", "")

    try {
        verify(authToken, secret);
    }

    catch(error) {
        response.status = '401';
        response.statusDescription = 'Unauthorized';
        response.body = JSON.stringify({error: 'Invalid token'});
        console.error(error);
    }

    callback(null, response);
}