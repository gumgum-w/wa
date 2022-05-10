'use strict';
module.exports = (sequelize, DataTypes) => {
  const WaInstance = sequelize.define('WaInstance', {
    running: DataTypes.BOOLEAN,
    connected: DataTypes.BOOLEAN,
    last_wid: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    display_name: DataTypes.STRING,
    profile_pic_thumb: DataTypes.STRING,
    qr_status: DataTypes.STRING,
    qr_code: DataTypes.STRING,
    browser_id: DataTypes.STRING,
    secret_bundle: DataTypes.STRING,
    token1: DataTypes.STRING,
    token2: DataTypes.STRING
  }, {
    underscored: true
  });
  WaInstance.associate = function (models) {
    // associations can be defined here
  };
  return WaInstance;
};
