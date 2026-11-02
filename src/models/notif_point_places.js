"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class NotifPointPlaces extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NotifPointPlaces.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      event_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      uuid_places: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name_places: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nama_provinsi: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "NotifPointPlaces",
      tableName: "notif_point_places",
      timestamps: true,
    },
  );
  return NotifPointPlaces;
};
