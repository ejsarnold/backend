"use strict";

const fp = require("fastify-plugin");
const { Resend } = require("resend");

module.exports = fp(async function (fastify, opts) {
 const resend = new Resend(fastify.config.RESEND_API_KEY);

  const email = {
    send: async (currentFastify, params) => {
      const response = await resend.emails.send({
        from: "Yappzy <no-reply@yappzy.com>",
        to: [params.email],
        subject: params.subject,
        text: params.message,
        // html: params.html || null,
        // attachments: params.attachments || [],
        // headers: params.headers || {},
        // tags: params.tags || [],
      });
      console.log(response)
      return { message: "Email sent successfully!", response };
    },
  };

  fastify.decorate("email", email);
});
