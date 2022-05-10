const express = require('express');
const path = require('path');
const Lumie = require('lumie');
const permissions = require('./permissions');

const app = express();

Lumie.load(app, {
    verbose: process.env.NODE_ENV !== 'test',
    preURL: 'tes',
    ignore: ['*.spec', '*.action'],
    permissions,
    controllers_path: path.join(__dirname, 'controllers')
});

const evn = process.env;
const server = app.listen(evn.PORT || 3200, evn.HOST || '127.0.0.1', () => {
    const { address, port } = server.address();
    if (process.env.NODE_ENV !== 'test') {
        console.log('Example app listening at http://%s:%s', address, port); /* eslint no-console: 0 */
    }
});

module.exports = app;
