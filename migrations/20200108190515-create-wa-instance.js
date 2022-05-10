'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('wa_instances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      running: {
        type: Sequelize.BOOLEAN
      },
      connected: {
        type: Sequelize.BOOLEAN
      },
      last_wid: {
        type: Sequelize.STRING
      },
      phone_number: {
        type: Sequelize.STRING
      },
      display_name: {
        type: Sequelize.STRING
      },
      profile_pic_thumb: {
        type: Sequelize.STRING
      },
      qr_status: {
        type: Sequelize.STRING
      },
      qr_code: {
        type: Sequelize.STRING
      },
      browser_id: {
        type: Sequelize.STRING
      },
      secret_bundle: {
        type: Sequelize.STRING
      },
      token1: {
        type: Sequelize.STRING
      },
      token2: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('wa_instances');
  }
};
