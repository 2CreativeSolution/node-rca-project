const { callIntegration } = require("../services/salesforce.service");
const { createHttpError } = require("../utils/httpErrors");

async function invokeAction(req, res, next) {
  try {
    const action = req.params.action;
    const data = await callIntegration(action, req.body);

    return res.json({
      user: req.user.uid,
      data
    });
  } catch (error) {
    return next(createHttpError(500, `${req.params.action} failed`, error));
  }
}

module.exports = {
  invokeAction
};
