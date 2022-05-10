const path = require('path')

module.exports = {
  development: {
    "username": "office",
    "password": "Gongpex_89",
    "database": "gumwa",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorsAliases: false
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DRIVER,
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    logging: false
  }
}
