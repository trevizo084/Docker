const request = require('supertest');
const express = require('express');
const carritoRouter = require('../controller/config/carritocontroller.js');
const db = require('../controller/config/dbsettings');

jest.mock('../controller/config/dbsettings', () => ({
  query: jest.fn(),
}));

// Mock del verifyToken middleware
jest.mock('../controller/config/logincontroller', () => ({
  verifyToken: (req, res, next) => {
    // Simula un usuario logueado
    req.session = req.session || {};
    req.session.user = { id: 1, username: 'testuser' };
    next();
  }
})); 

describe('Carrito Router', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Middleware para mockear session
    app.use((req, res, next) => {
      req.session = req.session || {};
      req.session.user = { id: 1, username: 'testuser' };
      next();
    });

    // Mock res.render
    app.response.render = function(view, options) {
      this.status(200).json({ view, options });
    };

    app.use('/carrito', carritoRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /carrito debería devolver productos', async () => {
    db.query.mockResolvedValueOnce([
      [{ id_carrito: 1, id_producto: 2, nombre: 'Test', precio: 100, cantidad: 1, stock: 5 }],
    ]);

    const res = await request(app)
      .get('/carrito')
      .set('Cookie', ['connect.sid=test-session-id']); // Simula 

    expect(res.statusCode).toBe(200);
    expect(res.body.view).toBe('carrito');
    expect(res.body.options.cartItems.length).toBe(1);
  });
});