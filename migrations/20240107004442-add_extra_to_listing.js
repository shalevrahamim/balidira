'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('listings', 'airConditioner', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'elevator', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'renovated', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'disabledAccess', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'MMD', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'storageRoom', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'animals', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'equipment', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'balcony', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'parking', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
    await queryInterface.addColumn('listings', 'immediateEntry', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('listings', 'airConditioner')
    await queryInterface.removeColumn('listings', 'elevator')
    await queryInterface.removeColumn('listings', 'renovated')
    await queryInterface.removeColumn('listings', 'disabledAccess')
    await queryInterface.removeColumn('listings', 'MMD')
    await queryInterface.removeColumn('listings', 'storageRoom')
    await queryInterface.removeColumn('listings', 'animals')
    await queryInterface.removeColumn('listings', 'equipment')
    await queryInterface.removeColumn('listings', 'balcony')
    await queryInterface.removeColumn('listings', 'parking')
    await queryInterface.removeColumn('listings', 'immediateEntry')
  },
}
