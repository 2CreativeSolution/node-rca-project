const { HttpError } = require("../utils/httpErrors");

function resolveSalesforceDuplicateError(error) {
  const responseData = error.cause?.response?.data || error.response?.data;
  if (!Array.isArray(responseData) || responseData.length === 0) {
    return null;
  }

  const duplicateError = responseData.find((item) => item?.errorCode === "DUPLICATES_DETECTED");
  if (!duplicateError) {
    return null;
  }

  return {
    statusCode: 409,
    message:
      duplicateError.duplicateResult?.errorMessage ||
      duplicateError.message ||
      "Duplicate record detected",
    code: "DUPLICATES_DETECTED"
  };
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const duplicateError = resolveSalesforceDuplicateError(error);
  if (duplicateError) {
    console.error(error.cause?.response?.data || error.response?.data);
    return res.status(duplicateError.statusCode).json({
      message: duplicateError.message,
      code: duplicateError.code
    });
  }

  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof HttpError ? error.message : "Internal server error";

  if (error.cause?.response?.data) {
    console.error(error.cause.response.data);
  } else {
    console.error(error.message);
  }

  return res.status(statusCode).json({ message });
}

module.exports = errorHandler;
