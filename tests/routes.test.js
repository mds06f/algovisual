// tests/routes.test.js
const request = require('supertest');
const app = require('../server');

describe('AlgoVisual Routes', () => {
  
  test('GET / should render the dashboard page successfully', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('AlgoVisual');
    expect(res.text).toContain('Sorting Systems');
    expect(res.text).toContain('Searching Systems');
  });

  test('GET /visualizer should load visualizer default (bubbleSort) successfully', async () => {
    const res = await request(app).get('/visualizer');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Algorithm Playground - AlgoVisual');
    // Verify it injects 'bubbleSort' by default
    expect(res.text).toContain("initPlayer('bubbleSort')");
  });

  test('GET /visualizer?algo=binarySearch should load visualizer with binarySearch successfully', async () => {
    const res = await request(app).get('/visualizer?algo=binarySearch');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Algorithm Playground - AlgoVisual');
    expect(res.text).toContain("initPlayer('binarySearch')");
  });
});
