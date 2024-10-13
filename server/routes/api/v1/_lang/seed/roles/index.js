"use strict";

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Seed"],
        params: {
          type: "object",
          properties: {
            lang: {
              type: "string",
              default: "en",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const data = {
          model: "roles",
          unique: "name",
          rows: [
            {
              name: "Admin",
            },
            {
              name: "General",
            },
          ],
        };
        const resp = await fastify.seed.create(data);
        reply.send(resp);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
