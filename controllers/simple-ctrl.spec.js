const test = require('ava');
const request = require('supertest');
const app = require('../app');

test('[GET] /simple-ctrl should pass', async (t) => {
    const { body, status } = await request(app)
    .get('/api/simple-ctrl')
    .set('Accept', 'application/json');

    t.is(status, 200);
    t.is(body.msg, 'I am a minimal implementation');
});

test('[GET] /simple-ctrl/number/12 should return 401', async (t) => {
    const { body, status } = await request(app)
    .get('/api/simple-ctrl/number/12')
    .set('Accept', 'application/json');

    t.is(status, 401);
    t.falsy(body.msg);
});
