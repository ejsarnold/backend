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
  return db.createTable("user_preferences", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: "int",
      unsigned: true,
      notNull: true,
      unique: true,
      foreignKey: {
        name: "user_preferences_users_user_id_foreign",
        table: "users",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
        mapping: "id",
      },
    },
    is_subscribed: {
      type: "boolean",
      defaultValue: false,
    },
    theme: {
      type: "string",
      notNull: true,
      defaultValue: "light",
    },
    language: {
      type: "string",
      notNull: true,
      defaultValue: "en",
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
  return db.dropTable("user_preferences");
};

exports._meta = {
  version: 1,
};
