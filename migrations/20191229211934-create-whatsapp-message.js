'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('wa_messages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      from: {
        type: Sequelize.STRING
      },
      to: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.STRING
      },
      from_me: {
        type: Sequelize.BOOLEAN
      },
      from_group: {
        type: Sequelize.BOOLEAN
      },
      status: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      has_media: {
        type: Sequelize.BOOLEAN
      },
      timestamp: {
        type: Sequelize.STRING
      },
      is_forwarded: {
        type: Sequelize.BOOLEAN
      },
      broadcast: {
        type: Sequelize.BOOLEAN
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
    return queryInterface.dropTable('wa_messages');
  }
};
