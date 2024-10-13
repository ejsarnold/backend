"use strict";

const fp = require("fastify-plugin");
const moment = require("moment");

module.exports = fp(async function (fastify, opts) {
  const seed = {
    reset: async (data) => {
      const query = await fastify.prisma[data.model].updateMany({
        where: {
          deleted_at: null,
        },
        data: {
          deleted_at: moment().toISOString(),
        },
      });
      return query;
    },
    processUniqueCondition: (data, row) => {
      var condition = {};
      if (typeof data.unique === "string" || data.unique instanceof String) {
        condition = {
          [data.unique]: row[data.unique],
        };
      } else {
        Object.keys(data.unique).forEach((key) => {
          condition[key] = {};
          data.unique[key].forEach((c) => {
            condition[key][c] = row[c];
          });
        });
      }
      return condition;
    },
    create: async (data) => {
      var countSuccess = 0;
      var countNew = 0;
      for (var rKey in data.rows) {
        const row = data.rows[rKey];
        //
        var condition = fastify.seed.processUniqueCondition(data, row);
        //
        var timestamp = moment().toISOString();
        //
        const query = await fastify.prisma[data.model].upsert({
          where: {
            ...condition,
          },
          update: {
            ...row,
            modified_at: timestamp,
            deleted_at: null,
          },
          create: {
            ...row,
            created_at: timestamp,
            modified_at: timestamp,
            deleted_at: null,
          },
        });
        //
        const seed = await fastify.prisma.seeds.upsert({
          where: {
            model_model_id: {
              model: data.model,
              model_id: query.id,
            },
          },
          update: {
            modified_at: timestamp,
          },
          create: {
            model: data.model,
            model_id: query.id,
            created_at: timestamp,
            modified_at: timestamp,
          },
        });
        //
        if (query) countSuccess++;
        if (moment(seed.modified_at).isSame(seed.created_at)) countNew++;
      }
      //
      var resp = `${countSuccess}/${data.rows.length} ( ${(
        (countSuccess / data.rows.length) *
        100
      ).toFixed(0)} % )`;
      if (countNew > 0) resp += `, new ${countNew}`;
      return `"${resp}"`;
    },
  };
  fastify.decorate("seed", seed);
});
