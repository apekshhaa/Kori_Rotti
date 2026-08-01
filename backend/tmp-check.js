const app = require('./src/app');
const request = require('supertest');

(async () => {
  try {
    const res = await request(app).get('/api/referrals/incoming');
    console.log('status', res.statusCode);
    console.log(res.text.slice(0, 800));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
