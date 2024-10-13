"use strict";

module.exports = async function (fastify, opts) {
  fastify.get(
    "/all",
    {
      schema: {
        tags: ["Seed"],
      },
    },
    async (request, reply) => {
      try {
        //
        var log = "";
        //BOC
        var models = [
          "roles",
          "users",
          "user-preferences"
        ];
        for (const model of models) {
          const res = await fastify.axios
            .get(fastify.config.APP_URL + "/api/v1/en/seed/" + model)
            .catch((e) => {
              throw new Error(`Error on ${model}: ${e}`);
            });
          log += "Seeded " + model + ": " + JSON.stringify(res.data) + "\n";
        }
        //EOC
        reply.send(log);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
