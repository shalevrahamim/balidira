'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('listings', 'isRoommates');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('listings', 'isRoommates', {
      type: Sequelize.BOOLEAN,
      defaultValue: 'rent', // Set a default value if needed
    });
  }
};
