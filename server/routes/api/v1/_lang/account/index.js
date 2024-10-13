"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post(
    "/send-email-otp",
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
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await fastify.prisma.users.findFirst({
          where: {
            email: request.body.email,
          },
          select: {
            id: true,
            phone_number: true,
            email: true,
            country_code: true,
            is_active: true,
            deleted_at: true,
          },
        });

        if (user) {
          return reply.status(409).send({
            error: "EmailAlreadyRegistered",
            message: "This email is already registered.",
          });
        }

        const otps = await fastify.prisma.otps.findMany({
          where: {
            email: request.body.email,
            purpose: "account_register",
            created_at: {
              gte: moment().subtract(2, "hours").toISOString(),
            },
          },
          select: {
            id: true,
            code: true,
            created_at: true,
          },
        });
        if (otps.length >= 5) {
          return reply.status(429).send({
            error: "TooManyRequestsError",
            message:
              "You have requested too many times. Try again after 2 hours later.",
          });
        }
        // BOC: Generate OTP
        const code = await fastify.otp.generateOtp(6);
        console.log("Generated OTP:", code);
        // EOC

        await fastify.prisma.otps.create({
          data: {
            email: request.body.email,
            purpose: "account_register",
            code: "123456",
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        // Send OTP success message
        reply.send({ message: "OTP has been sent." });
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

  fastify.post(
    "/check-email-otp",
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
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            otp: {
              type: "string",
              minLength: 6,
              maxLength: 6,
              pattern: "^[0-9]{6}$",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const otp = await fastify.prisma.otps.findFirst({
          where: {
            email: request.body.email,
            purpose: "account_register",
          },
          select: {
            id: true,
            code: true,
            email: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        });
        if (!otp || otp.code != request.body.otp) {
          return reply.status(400).send({
            error: "InvalidOTPError",
            message: "The provided OTP is invalid.",
          });
        }
        var now = moment();
        if (now.diff(moment(otp.created_at).add(5, "minutes"), "minutes") > 0) {
          return reply.status(400).send({
            error: "OTPExpiredError",
            message: "The OTP has expired, please request a new one.",
          });
        }
        await fastify.prisma.otps.deleteMany({
          where: {
            email: request.body.email,
            purpose: "account_register",
          },
        });
        var resp = {};
        resp.is_otp_valid = true;
        //
        reply.send(resp);
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

  fastify.post(
    "/send-mobile-otp",
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
              pattern: "^[+][0-9]{10,15}$",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await fastify.prisma.users.findFirst({
          where: {
            phone_number: request.body.phone_number,
          },
          select: {
            id: true,
            phone_number: true,
            email: true,
            country_code: true,
            is_active: true,
            deleted_at: true,
          },
        });

        if (user) {
          return reply.status(409).send({
            error: "PhoneNumberAlreadyRegistered",
            message: "This phone number is already registered.",
          });
        }

        const otps = await fastify.prisma.otps.findMany({
          where: {
            phone_number: request.body.phone_number,
            purpose: "account_register",
            created_at: {
              gte: moment().subtract(2, "hours").toISOString(),
            },
          },
          select: {
            id: true,
            code: true,
            created_at: true,
          },
        });
        if (otps.length >= 5) {
          return reply.status(429).send({
            error: "TooManyRequestsError",
            message:
              "You have requested too many times. Try again after 2 hours later.",
          });
        }
        // BOC: Generate OTP
        const code = await fastify.otp.generateOtp(6);
        console.log("Generated OTP:", code);
        // EOC

        await fastify.prisma.otps.create({
          data: {
            phone_number: request.body.phone_number,
            purpose: "account_register",
            code: "123456",
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        // Send OTP success message
        reply.send({ message: "OTP has been sent." });
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

  fastify.post(
    "/check-mobile-otp",
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
              pattern: "^[+][0-9]{10,15}$",
            },
            otp: {
              type: "string",
              minLength: 6,
              maxLength: 6,
              pattern: "^[0-9]{6}$",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const otp = await fastify.prisma.otps.findFirst({
          where: {
            phone_number: request.body.phone_number,
            purpose: "account_register",
          },
          select: {
            id: true,
            code: true,
            email: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        });
        if (!otp || otp.code != request.body.otp) {
          return reply.status(400).send({
            error: "InvalidOTPError",
            message: "The provided OTP is invalid.",
          });
        }
        var now = moment();
        if (now.diff(moment(otp.created_at).add(5, "minutes"), "minutes") > 0) {
          return reply.status(400).send({
            error: "OTPExpiredError",
            message: "The OTP has expired, please request a new one.",
          });
        }
        await fastify.prisma.otps.deleteMany({
          where: {
            phone_number: request.body.phone_number,
            purpose: "account_register",
          },
        });
        var resp = {};
        resp.is_otp_valid = true;
        //
        reply.send(resp);
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

  fastify.post(
    "/register",
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
          required: [
            "email",
            "first_name",
            "last_name",
            "password",
            "method",
            "key",
            "is_subscribed",
            "language",
          ],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            phone_number: {
              type: "string",
              pattern: "^[+][0-9]{10,15}$",
            },
            country_code: {
              type: "string",
            },
            first_name: {
              type: "string",
            },
            last_name: {
              type: "string",
            },
            password: {
              type: "string",
            },
            method: {
              type: "string",
            },
            key: {
              type: "string",
            },
            profile_picture_url: {
              type: "string",
            },
            is_subscribed: {
              type: "boolean",
            },
            language: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user_email = await fastify.prisma.users.findFirst({
          where: {
            email: request.body.email,
          },
          select: {
            id: true,
            phone_number: true,
            email: true,
            country_code: true,
            is_active: true,
            deleted_at: true,
          },
        });

        if (user_email) {
          return reply.status(409).send({
            error: "EmailAlreadyRegistered",
            message: "This email is already registered.",
          });
        }

        const user_mobile = await fastify.prisma.users.findFirst({
          where: {
            phone_number: request.body.phone_number,
          },
          select: {
            id: true,
            phone_number: true,
            email: true,
            country_code: true,
            is_active: true,
            deleted_at: true,
          },
        });

        if (user_mobile) {
          return reply.status(409).send({
            error: "PhoneNumberAlreadyRegistered",
            message: "This phone number is already registered.",
          });
        }
        let password = await fastify.bcrypt.hash(request.body.password);
        const user = await fastify.prisma.users.create({
          data: {
            email: request.body.email,
            phone_number: request.body.phone_number || null,
            country_code: request.body.country_code || null,
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            password: password,
            method: request.body.method,
            key: request.body.key,
            profile_picture_url: request.body.profile_picture_url,
            role_id: 2,
            last_login_at:  moment().toISOString(),
            email_verified_at:  moment().toISOString(),
            phone_number_verified_at: request.body.phone_number? moment().toISOString(): null,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            phone_number: true,
            email: true,
            country_code: true,
            is_active: true,
            deleted_at: true,
            roles: true,
          },
        });
        const user_preference = await fastify.prisma.user_preferences.create({
          data: {
            user_id: user.id,
            is_subscribed: request.body.is_subscribed,
            language: request.body.language,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
          select:{
            is_subscribed: true,
            language : true,
            theme: true
          }
        });

        let res = {}
        res.id = user.id
        res.email = user.email
        res.role = user.roles.name
        const token = fastify.jwt.sign(res)

        res.first_name = user.first_name
        res.last_name = user.last_name
        res.email = user.email
        res.token = token
        res.user_preferences = user_preference

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
