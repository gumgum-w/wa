'use strict';
module.exports = (sequelize, DataTypes) => {
  const WaMessage = sequelize.define('WaMessage', {
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    body: DataTypes.STRING,
    from_me: DataTypes.BOOLEAN,
    from_group: DataTypes.BOOLEAN,
    status: DataTypes.STRING,
    type: DataTypes.STRING,
    has_media: DataTypes.BOOLEAN,
    timestamp: DataTypes.STRING,
    is_forwarded: DataTypes.BOOLEAN,
    broadcast: DataTypes.BOOLEAN
  }, {
    underscored: true
  });
  WaMessage.associate = function (models) {
    // associations can be defined here
  };
  return WaMessage;
};
