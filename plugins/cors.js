"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function(fastify, opts) {
  fastify.register(require('@fastify/cors'), { 
    origin: ['http://127.0.0.1:3000'],
  })
})
