// utils/sendSMS.js
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: to.startsWith("+") ? to : `+91${to}`
    });
  } catch (error) {
    console.error("SMS sending failed:", error.message);
  }
};

module.exports = sendSMS;
