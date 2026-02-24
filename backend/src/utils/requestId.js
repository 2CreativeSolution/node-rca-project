const { randomUUID } = require("crypto");

function resolveRequestId(incomingId) {
  if (incomingId && typeof incomingId === "string") {
    return incomingId;
  }

  return randomUUID();
}

module.exports = {
  resolveRequestId
};
