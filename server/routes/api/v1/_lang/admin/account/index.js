"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post(
    "/login",
    {
      schema: {
        tags: ["Admin"],
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
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await fastify.prisma.users.findUnique({
          where: {
            email: request.body.email,
          },
          select: {
            id: true,
            phone_number: true,
            first_name: true,
            last_name: true,
            email: true,
            password: true,
            country_code: true,
            is_active: true,
            profile_picture_url: true,
            deleted_at: true,
            roles: true,
          },
        });

        if (!user) {
          return reply.status(400).send({
            error: "InvalidCredentials",
            message: "Email or password is incorrect.",
          });
        }

        if (user.roles.name != 'Admin') {
          return reply.status(400).send({
            error: "InvalidCredentials",
            message: "Email or password is incorrect.",
          });
        }

        if (!user.is_active) {
          return reply.status(403).send({
            error: "AccountDeactivated",
            message: "Your account is deactivated.",
          });
        }

        if (user.deleted_at) {
          return reply.status(410).send({
            error: "AccountDeleted",
            message: "Your account is deleted.",
          });
        }
        const validation = await fastify.bcrypt.compare(
          request.body.password,
          user.password
        );

        if (!validation) {
          return reply.status(400).send({
            error: "InvalidCredentials",
            message: "Email or password is incorrect.",
          });
        }

        let res = {};
        res.id = user.id;
        res.email = user.email;
        res.role = user.roles.name;
        const token = fastify.jwt.sign(res);

        res.first_name = user.first_name;
        res.last_name = user.last_name;
        res.email = user.email;
        res.profile_picture_url = user.profile_picture_url;
        res.token = token;

        reply.send(res);
      } catch (error) {
        console.error(error);
        reply.status(500).send({
          error: "InternalServerError",
          message: "An error occurred.",
        });
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
