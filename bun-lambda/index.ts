import { verify } from "jsonwebtoken";

interface CloudfrontEvent {
    version: string,
    context: AWSLambda.CloudFrontEvent['config']
    viewer : {
        ip: string
    },
    request: CFRequest
}

interface CFRequest extends Omit<AWSLambda.CloudFrontRequest, 'headers'> {
    cookies: string,
    headers: CloudFrontHeaders
}

interface CloudFrontHeaders {
    [name: string]: {
        key?: string | undefined;
        value: string;
    };
}


interface CloudFrontResponse extends Omit<AWSLambda.CloudFrontResultResponse, 'headers'> {
    statusCode: number,
    headers?: CloudFrontHeaders
}

export const handler = async (event: CloudfrontEvent) => {
    let authToken = '';
    const secret = process.env.JWT_SECRET ?? '';

    if (event.request.headers['Authorization']) 
        authToken = event.request.headers['Authorization'].value.replace("Bearer ", "")

    const response: CloudFrontResponse = {
        statusCode: 200,
        status: 'OK'
    }

    try {
        verify(authToken, secret);
    }

    catch(err) {
        response.status = 'Unauthorized';
        response.statusCode = 401;
        console.error(err);
    }

    return response;
}