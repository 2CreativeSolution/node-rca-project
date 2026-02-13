require("dotenv").config();

module.exports = {
  loginUrl: process.env.SF_LOGIN_URL,
  clientId: process.env.SF_CLIENT_ID,
  clientSecret: process.env.SF_CLIENT_SECRET,
  apiVersion: "v60.0"
};
