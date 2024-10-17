"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  const sms = {
    send: async (currentFastify, params) => {
      try {
        console.log(params)
        let messaging_option = params.messaging_option;
        if (messaging_option == "mobile") {
          const ret = await fastify.uniClient.messages.send({
            to: params.phone_number,
            text: params.message,
          });
          console.log(ret)
        } else {
          await fastify.email.send(currentFastify, params);
        }
      } catch (error) {
        return { message: error };
      }

      return { message: "Success!" };
    },
  };
  fastify.decorate("sms", sms);
});
