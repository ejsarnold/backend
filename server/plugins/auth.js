'use strict'

const fp = require("fastify-plugin")

module.exports = fp(async function(fastify, opts) {
  fastify.register(require("@fastify/jwt"), {
    secret: "yappzychatapp",
    messages:{
      noAuthorizationInHeaderMessage:'No Authorization was found.',
    },
    sign:{
      expiresIn: 60 * 60 * 24 * 365, //in seconds, expires in 1 year
    },
  })
  fastify.decorate("authIsAdmin", async function(request, reply) {
    try {
      await request.jwtVerify()
      if(!request.user.role) throw new Error('Missing role.')
      if(request.user.role != 'Admin') throw new Error('Invalid role.')
    } catch (err) {
      reply.send(err)
    }
  })
  fastify.decorate("authenticate", async function(request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
})