"use strict";

const fp = require("fastify-plugin");
module.exports = fp(async function (fastify, opts) {
  const OAS3Format = {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "none",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  };
  fastify.register(require("@fastify/swagger-ui"), OAS3Format);
});
