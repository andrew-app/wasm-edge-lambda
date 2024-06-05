import { verify, type JwtPayload } from "jsonwebtoken";

import type { CloudFrontRequestEvent, CloudFrontFunctionsEvent, CloudFrontRequestCallback } from "aws-lambda";
import { ExceptionHandler } from "./errors";

interface CustomClaims extends JwtPayload {
    permissions?: string[];
}
declare module "bun" {
    interface Env {
      JWT_SECRET: string;
    }
}

const JWT_SECRET = process.env.JWT_SECRET;

export const handler = (event: CloudFrontRequestEvent, _context: CloudFrontFunctionsEvent['context'], callback: CloudFrontRequestCallback) => {
    let authToken = '';

    const exceptionHandler = new ExceptionHandler(callback);
    
    const request = event.Records[0].cf.request;
    const validPermissions = ['view:data'];
    let isAuthorised = false;

    if (request.headers['authorization'])
        authToken = request.headers['authorization'][0].value.replace("Bearer ", "")

    try {
        const decodedToken = verify(authToken, JWT_SECRET) as CustomClaims;

        if (decodedToken.permissions) {
            isAuthorised = validPermissions.every(permission => decodedToken.permissions?.includes(permission) ?? false);
        } else {
            throw new Error('No permissions found in custom claims');
        }
    }

    catch(error) {
        console.error(error);
        exceptionHandler.onUnauthorisedRequest('Invalid token');
    }

    if (!isAuthorised) {
        exceptionHandler.onForbiddenRequest('Not authorised to view data.');
    }

    callback(null, request);
}