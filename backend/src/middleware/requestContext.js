const { resolveRequestId } = require("../utils/requestId");

function requestContext(req, res, next) {
  const requestId = resolveRequestId(req.headers["x-request-id"]);
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const start = Date.now();
  res.on("finish", () => {
    const log = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start
    };

    console.info(JSON.stringify(log));
  });

  next();
}

module.exports = requestContext;
