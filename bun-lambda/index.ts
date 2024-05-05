import { verify } from "jsonwebtoken";
import type { CloudFrontRequestEvent, CloudFrontFunctionsEvent, CloudFrontRequestCallback, CloudFrontResponse, CloudFrontRequestResult } from "aws-lambda";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({region: 'ap-southeast-2'});

const parameterCommand = new GetParameterCommand({ Name: 'JWT_SECRET_KEY', WithDecryption: true });

const response: CloudFrontRequestResult = {
    status: '200',
    statusDescription: 'OK',
    headers: {
        'cache-control': [{
            key: 'Cache-Control',
            value: 'max-age=100'
        }],
        'content-type': [{
            key: 'Content-Type',
            value: 'text/plain'
        }]
    }
};

export const handler = async (event: CloudFrontRequestEvent, _context: CloudFrontFunctionsEvent['context'], callback: CloudFrontRequestCallback) => {
    let authToken = '';
    const secretKey = (await ssmClient.send(parameterCommand)).Parameter?.Value || '';
    const request = event.Records[0].cf.request;

    if (request.headers['authorization'])
        authToken = request.headers['authorization'][0].value.replace("Bearer ", "")

    try {
        verify(authToken, secretKey);
    }

    catch(error) {
        response.status = '401';
        response.statusDescription = 'Unauthorized';
        response.body = 'Error: Invalid token\n';
        console.error(error);
    }

    callback(null, response);
}