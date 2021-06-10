"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(response) {
        super(`${response.status} ${response.statusText}\nURL: ${response.url}`);
        this.name = "HttpError";
        this.response = response;
        this.statusCode = response.status;
        this.status = response.status;
        this.statusText = response.statusText;
    }
    async parse() {
        if (!this.response.bodyUsed) {
            try {
                const type = this.response.headers.get("Content-Type") || "text/plain";
                if (type.match(/\bjson\b/i)) {
                    this.body = await this.response.json();
                    if (this.body.error) {
                        this.message += "\n" + this.body.error;
                        if (this.body.error_description) {
                            this.message += ": " + this.body.error_description;
                        }
                    }
                    else {
                        this.message += "\n\n" + JSON.stringify(this.body, null, 4);
                    }
                }
                else if (type.match(/^text\//i)) {
                    this.body = await this.response.text();
                    if (this.body) {
                        this.message += "\n\n" + this.body;
                    }
                }
            }
            catch {
                // ignore
            }
        }
        return this;
    }
    toJSON() {
        return {
            name: this.name,
            statusCode: this.statusCode,
            status: this.status,
            statusText: this.statusText,
            message: this.message
        };
    }
}
exports.default = HttpError;
