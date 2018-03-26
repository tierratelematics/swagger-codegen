import IHttpClient from "./IHttpClient";
import { Observable } from "rxjs/Observable";
import "whatwg-fetch";
import HttpResponse from "./HttpResponse";
import {injectable} from "inversify";
import * as _ from "lodash";
import 'rxjs/add/operator/fromPromise';


@injectable()
class HttpClient implements IHttpClient {

    get(url: string, headers?: _.Dictionary<string>): Observable<HttpResponse> {
        return this.performNetworkCall(url, "get", undefined, headers);
    }

    post(url: string, body: {}|FormData, headers?: _.Dictionary<string>): Observable<HttpResponse> {
        return this.performNetworkCall(url, "post", this.getJsonBody(body), this.addJsonHeaders(headers));
    }

    put(url: string, body: {}, headers?: _.Dictionary<string>): Observable<HttpResponse> {
        return this.performNetworkCall(url, "put", this.getJsonBody(body), this.addJsonHeaders(headers));
    }

    delete(url: string, headers?: _.Dictionary<string>): Observable<HttpResponse> {
        return this.performNetworkCall(url, "delete", undefined, headers);
    }

    private getJsonBody(body: {}|FormData) {
        return !(body instanceof FormData) ? JSON.stringify(body) : body;
    }

    private addJsonHeaders(headers: _.Dictionary<string>) {
        return _.merge({}, {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }, headers);
    };

    private performNetworkCall(url: string, method: string, body?: any, headers?: _.Dictionary<string>): Observable<HttpResponse> {
        let promise = window.fetch(url, {
            method: method,
            body: body,
            headers: <any>headers
        }).then(response => {
            let headers: _.Dictionary<string> = {};
            response.headers.forEach((value, name) => {
                headers[name.toString().toLowerCase()] = value;
            });
            return response.text().then(text => {
                let contentType = headers["content-type"] || "";
                let payload = contentType.match("application/json") ? JSON.parse(text) : text;
                let httpResponse = new HttpResponse(payload, response.status, headers);

                if (response.status >= 400)
                    throw httpResponse;
                return httpResponse;
            });
        });
        return Observable.fromPromise(promise);
    }
}

export default HttpClient