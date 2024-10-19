"use strict";

const path = require("path");
const AutoLoad = require("@fastify/autoload");
const fastifyEnv = require("@fastify/env");

const schema = {
  type: "object",
  required: [
    'ENV',
    'APP_NAME',
    'APP_URL',
    'DB_SSL',
    'DB_HOST',
    'DB_PORT',
    'DB_DATABASE',
    'DB_USERNAME',
    'DB_PASSWORD',
    'BUCKET_NAME',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'S3_ENDPOINT',
    'SPACE_DIR',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CLIENT_ID',
    'RESEND_API_KEY',
    'NOTIFY_SENDER_ID',
    'NOTIFY_USER_ID',
    'NOTIFY_API_KEY'
  ],
  properties: {
    ENV: {
      type: 'string',
    },
    DB_SSL: {
      type: 'boolean',
    },
    APP_NAME: {
      type: 'string',
    },
    APP_URL: {
      type: 'string',
    },
    DB_HOST: {
      type: 'string',
      default: 'localhost',
    },
    DB_PORT: {
      type: 'string',
      default: 5432,
    },
    DB_DATABASE: {
      type: 'string',
    },
    DB_USERNAME: {
      type: 'string',
    },
    DB_PASSWORD: {
      type: 'string',
    },
    BUCKET_NAME: {
      type: 'string',
    },
    AWS_ACCESS_KEY_ID: {
      type: 'string',
    },
    AWS_SECRET_ACCESS_KEY: {
      type: 'string',
    },
    S3_ENDPOINT: {
      type: 'string',
    },
    SPACE_DIR: {
      type: 'string',
    },
    GOOGLE_CLIENT_SECRET: {
      type: 'string',
    },
    GOOGLE_CLIENT_ID: {
      type: 'string'
    },
    RESEND_API_KEY: {
      type: 'string'
    },
    NOTIFY_API_KEY: {
      type: 'string'
    },
    NOTIFY_USER_ID: {
      type: 'number'
    },
    NOTIFY_SENDER_ID: {
      type: 'string'
    },
  }
};

const options = {
  schema: schema,
  dotenv: true,
};

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {};

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(fastifyEnv, options).after((err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "plugins"),
      options: Object.assign({}, opts),
    });

    // This loads all plugins defined in routes
    // define your routes in one of these
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "routes"),
      options: Object.assign({}, opts),
      routeParams: true,
    });
  });
};
