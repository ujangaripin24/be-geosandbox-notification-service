"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("notif_point_places", "uuid_places", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("notif_point_places", "username", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("notif_point_places", "username", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
