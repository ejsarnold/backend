// prismaPlugin.js

const fp = require("fastify-plugin");
const { PrismaClient } = require("@prisma/client");

module.exports = fp(async function (fastify, opts) {
  const prisma = new PrismaClient();
  fastify.decorate("prisma", prisma);
});
