'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notif_point_places extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  notif_point_places.init({
    uuid: DataTypes.STRING,
    event_type: DataTypes.STRING,
    username: DataTypes.STRING,
    name_places: DataTypes.STRING,
    nama_provinsi: DataTypes.STRING,
    is_read: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'notif_point_places',
  });
  return notif_point_places;
};