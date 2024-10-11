"use strict";
var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable("users", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: "string",
      notNull: true,
    },
    last_name: {
      type: "string",
      notNull: true,
    },
    password: {
      type: "string",
    },
    phone_number: {
      type: "string",
      notNull: true,
      unique: true,
    },
    email: {
      type: "string",
      notNull: true,
      unique: true,
    },
    country_code: {
      type: "string",
      notNull: true,
    },
    method: {
      type:'string',
      notNull: true,
    },
    is_active: {
      type: "boolean",
      defaultValue: true,
    },
    device_id: {
      type:'string',
      null: true
    },
    last_login_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    created_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    modified_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    deleted_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("users");
};

exports._meta = {
  version: 1,
};
