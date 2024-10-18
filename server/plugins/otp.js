"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  const otp = {
    generateOtp(n) {
      var digits = "0123456789";
      let otp = "";
      for (let i = 0; i < n; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
      }
      return otp;
    },
    send: async (currentFastify, params, code) => {
        const message = `Yappzy: Your OTP is ${code}. Only valid for 5 mins.`;

        const sms = {
          phone_number: params.phone_number,
          email: params.email,
          messaging_option: params.messaging_option,
          subject: "OTP",
          message: message,
        };
        let sendSms = await fastify.sms.send(fastify, sms);
        return sendSms;
    },
  };
  fastify.decorate("otp", otp);
});
