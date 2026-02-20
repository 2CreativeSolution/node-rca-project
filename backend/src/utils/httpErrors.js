class HttpError extends Error {
  constructor(statusCode, message, cause) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

function createHttpError(statusCode, message, cause) {
  return new HttpError(statusCode, message, cause);
}

module.exports = {
  HttpError,
  createHttpError
};
