"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {

  fastify.post(
    "/update-information",
    {
     preValidation: [fastify.authenticate],
      schema: {
        tags: ["User"],
        security: [{ bearerAuth: [] }],
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
            "first_name",
            "last_name",
            "password",
          ],
          properties: {
            first_name: {
              type: "string",
            },
            last_name: {
              type: "string",
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

        let password = await fastify.bcrypt.hash(request.body.password);
        const user = await fastify.prisma.users.update({
            where:{
                id: request.user.id,
            },
            data: {
              first_name: request.body.first_name,
              last_name: request.body.last_name,
              password: password,
              modified_at: moment().toISOString(),
            },
            select: {
              id: true,
              phone_number: true,
              first_name: true,
              last_name: true,
              email: true,
              country_code: true,
              profile_picture_url: true,
            },
          });
          let res = {};
          let result = {}
          res.message = "Your account has been created succesfully."
          res.is_success = true
          result.User = user
          res.result = result
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

  fastify.post(
    "/send-verification-mobile",
    {
     preValidation: [fastify.authenticate],
      schema: {
        tags: ["User"],
        security: [{ bearerAuth: [] }],
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
              pattern: "^[0-9]{10,15}$",
            }
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
            purpose: 'account_register',
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

        //BOC: send OTP
       let sendOtp =  await fastify.otp.send(
          fastify,
          {
            phone_number: request.body.phone_number,
            messaging_option: 'mobile',
          },
          code
        );
        if(sendOtp.error){
          throw new Error(sendOtp.error)
        }
        //EOC


        await fastify.prisma.otps.create({
          data: {
            phone_number: request.body.phone_number,
            purpose: 'account_register',
            code:code,
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
    "/update-mobile",
    {
      preValidation: [fastify.authenticate],
      schema: {
        tags: ["User"],
        security: [{ bearerAuth: [] }],
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
          required: ["phone_number", "country_code", "otp"],
          properties: {
            phone_number: {
              type: "string",
              pattern: "^[+]?[0-9]{10,15}$",
            },
            country_code: {
              type: "string",
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
            purpose: 'account_register',
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
            purpose: 'account_register',
          },
        });

        const user = await fastify.prisma.users.update({
            where:{
                id: request.user.id,
            },
            data: {
              phone_number: request.body.phone_number,
              country_code: request.body.country_code,
              phone_number_verified_at:  moment().toISOString(),
              modified_at: moment().toISOString(),
            },
            select: {
              id: true,
              phone_number: true,
              first_name: true,
              last_name: true,
              email: true,
              country_code: true,
              profile_picture_url: true,
            },
          });
        //
        let res = {};
        let result = {}
        res.message = 'Your mobile number has been verified.'
        res.is_success = true
        result.User = user
        res.result = result
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
