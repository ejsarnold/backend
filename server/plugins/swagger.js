"use strict";

const fp = require("fastify-plugin");
const pack = require("./../package.json");

module.exports = fp(async function (fastify, opts) {
  const OAS3Format = {
    swagger: {
      info: {
        title: "Fastify API Documentation",
        description: "API documentation for Fastify",
        version: pack.version,
      },
      schemes: ["http","https"],
      tags: [
        { name: "Auth", description: "Auth related end-points" },
      ],
      servers: [
        {
          url: fastify.config.APP_URL,
        },
      ],
      securityDefinitions: {
        bearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: "Bearer token authentication",
        },
      },
    },
    hideUntagged: true,
    exposeRoute: true,
  };
  fastify.register(require("@fastify/swagger"), OAS3Format);
});
