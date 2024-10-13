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
    role_id: {
      type: "int",
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: "users_roles_role_id_foreign",
        table: "roles",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
        mapping: "id",
      },
    },
    password: {
      type: "string",
      null: true
    },
    phone_number: {
      type: "string",
      null: true,
    },
    email: {
      type: "string",
      notNull: true,
      unique: true,
    },
    country_code: {
      type: "string",
      null: true,
    },
    method: {
      type:'string',
      notNull: true,
    },
    key: {
      type:'string',
      notNull: true,
    },
    status: {
      type:'string',
      defaultValue: 'Online',
    },
    is_active: {
      type: "boolean",
      defaultValue: true,
    },
    device_id: {
      type:'text',
      null: true
    },
    profile_picture_url : {
      type:'text',
      null: true
    },
    last_login_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    last_seen_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    phone_number_verified_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    email_verified_at: {
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
