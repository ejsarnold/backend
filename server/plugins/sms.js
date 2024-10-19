"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  const sms = {
    send: async (currentFastify, params) => {
        let sms;
        let messaging_option = params.messaging_option;
        if (messaging_option == "mobile") {
        sms =  await fastify.axios.post("https://app.notify.lk/api/v1/send", {
            api_key: fastify.config.NOTIFY_API_KEY,
            user_id: fastify.config.NOTIFY_USER_ID,
            sender_id: fastify.config.NOTIFY_SENDER_ID,
            to: params.phone_number,
            message: params.message,
          });
        } else {
         sms = await fastify.email.send(currentFastify, params);
        }
      return sms;
    },
    
  };
  fastify.decorate("sms", sms);
});
