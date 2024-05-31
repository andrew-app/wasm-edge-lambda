
import { HttpErrorResponse } from "./error-codes";
import type { CloudFrontRequestCallback, CloudFrontRequestResult } from "aws-lambda";

export class ExceptionHandler {
    cfResponse: CloudFrontRequestResult;
    callback: CloudFrontRequestCallback;
    
    constructor(callback: CloudFrontRequestCallback) {
        this.cfResponse = {
            status: '',
            headers: {
                'content-type': [{
                    key: 'Content-Type',
                    value: 'application/json'
                }]
            },
            bodyEncoding: 'text',
        }
        this.callback = callback;
    }

    onUnauthorisedRequest(message?: string) {
        const unauthorisedResponse = {
            ...this.cfResponse,
            ...HttpErrorResponse.UNAUTHORIZED,
            body: JSON.stringify({ error: message || 'Unauthorized' })
        }
        this.callback(null, unauthorisedResponse);
    }

    onForbiddenRequest(message?: string) {
        const forbiddenResponse = {
            ...this.cfResponse,
            ...HttpErrorResponse.FORBIDDEN,
            body: JSON.stringify({ error: message || 'Forbidden' })
        }
        this.callback(null, forbiddenResponse);
    }
}
