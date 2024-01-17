'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the data type of the 'floor' column to STRING
    await queryInterface.changeColumn('listings', 'floor', {
      type: Sequelize.STRING,
      allowNull: true, // Modify this based on your requirements
    })
  },

  down: async (queryInterface, Sequelize) => {
    // Change the data type back to INTEGER (if needed)
    await queryInterface.changeColumn('listings', 'floor', {
      type: Sequelize.INTEGER,
      allowNull: true, // Modify this based on your requirements
    })
  },
}
