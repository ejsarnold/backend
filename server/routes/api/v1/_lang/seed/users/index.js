"use strict";

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Seed"],
      },
    },
    async (request, reply) => {
      try {
        const data = {
          model: "users",
          unique: "email",
          rows: [
            {
              first_name: "Niroshan",
              last_name: "Rajh",
              role_id: 1,
              password: await fastify.bcrypt.hash('Admin@1234'),
              email:'admin@gmail.com',
              method:'email',
              key:'admin@gmail.com'
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
