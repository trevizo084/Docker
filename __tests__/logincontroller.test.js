// __tests__/logincontroller.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');


// Mock dbsettings
jest.mock('../controller/config/dbsettings', () => ({
  query: jest.fn()
}));
const db = require('../controller/config/dbsettings');

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));
const bcrypt = require('bcrypt');

// Importar el router después de mocks
const { router } = require('../controller/config/logincontroller');

describe('POST /iniciosesion', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Simular sesiones
    app.use((req, res, next) => {
      req.session = {};
      next();
    });

    app.use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería validar usuario y devolver token y datos de usuario', async () => {
    // Mock datos de BD
    db.query.mockResolvedValueOnce([
      [{ id_usuario: 1, nombre: 'Test User', correo: 'test@mail.com', contraseña: 'hashedpw' }]
    ]);

    // Mock bcrypt
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/iniciosesion')
      .send({ correo: 'test@mail.com', contraseña: '123456' });

    // Verifica status
    expect(res.status).toBe(200);

    // Verifica token generado
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();

    // Verifica que el usuario está en la respuesta
    expect(res.body.user).toEqual({
      id: 1,
      nombre: 'Test User',
      correo: 'test@mail.com'
    });
  });

  test('debería rechazar credenciales inválidas', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    db.query.mockResolvedValueOnce([[]]); // usuario no encontrado

    const res = await request(app)
        .post('/iniciosesion')
        .send({ correo: 'wrong@mail.com', contraseña: '123456' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales incorrectas');

    expect(consoleSpy).toHaveBeenCalledWith("Error: usuario no encontrado");

    consoleSpy.mockRestore();
  });
});
