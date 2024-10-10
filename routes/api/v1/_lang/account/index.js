"use strict";

module.exports = async function (fastify, opts) {
  fastify.post(
    "/send-otp",
    {
      schema: {
        tags: ["Auth"],
        params: {
          type: "object",
          properties: {
            lang: {
              type: "string",
              default: "en",
            },
          },
        },
        body: {
          type: "object",
          required: ["phone_number"],
          properties: {
            phone_number: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        reply.send({ message: "OTP has been sent." });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/check-otp",
    {
      schema: {
        tags: ["Auth"],
        params: {
          type: "object",
          properties: {
            lang: {
              type: "string",
              default: "en",
            },
          },
        },
        body: {
          type: "object",
          required: ["phone_number", "otp"],
          properties: {
            phone_number: {
              type: "string",
            },
            otp: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        reply.send({ message: "Login success." });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
