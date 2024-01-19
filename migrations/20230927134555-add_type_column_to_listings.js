'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('listings', 'type', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'rent', // Set the default value to 'sell'
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('listings', 'type')
  },
}
