"use strict";

const fp = require("fastify-plugin");
const { UniClient } = require("uni-sdk");

module.exports = fp(async function (fastify, opts) {
  const uniClient = new UniClient({
    accessKeyId: "WohjB8gWciCk4ykcwnRNGP",
    //accessKeySecret: "your access key secret",
  });

  fastify.decorate("uniClient", uniClient);
});
