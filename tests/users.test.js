process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/app');

describe('Users API', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Esta bien');
  });

  test('GET /users returns empty list initially', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /users creates a user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Ada Lovelace', email: 'ada@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com' });
    expect(res.body.id).toBeDefined();
  });

  test('POST /users rejects invalid payload', async () => {
    const res = await request(app).post('/users').send({ name: '' });
    expect(res.status).toBe(400);
  });

  test('POST /users rejects duplicate email', async () => {
    await request(app).post('/users').send({ name: 'A', email: 'dup@example.com' });
    const res = await request(app).post('/users').send({ name: 'B', email: 'dup@example.com' });
    expect(res.status).toBe(409);
  });

  test('GET /users/:id returns the created user', async () => {
    const created = await request(app)
      .post('/users')
      .send({ name: 'Grace Hopper', email: 'grace@example.com' });

    const res = await request(app).get(`/users/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('grace@example.com');
  });

  test('GET /users/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/users/999999');
    expect(res.status).toBe(404);
  });

  test('GET /users/:id returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/users/not-a-number');
    expect(res.status).toBe(400);
  });
});
