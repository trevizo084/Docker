// __tests__/registroController.test.js
const request = require('supertest');
const express = require('express');

// Mock de dbsettings
jest.mock('../controller/config/dbsettings', () => ({
  query: jest.fn(),
}));
const db = require('../controller/config/dbsettings');

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));
const bcrypt = require('bcrypt');

// Importamos el router después de los mocks
const registroRouter = require('../controller/config/registroController');

describe('POST /registrar', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(registroRouter); // Montamos el router
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería registrar un usuario nuevo correctamente', async () => {
    // Simular que el correo no existe
    db.query
      .mockResolvedValueOnce([[]]) // primera consulta SELECT correo = ?
      .mockResolvedValueOnce([{ insertId: 1 }]); // segunda consulta INSERT

    // Simular bcrypt.hash
    bcrypt.hash.mockResolvedValueOnce('hashedPassword123');

    const res = await request(app)
      .post('/registrar')
      .send({ nombre_usuario: 'Nuevo', correo: 'nuevo@mail.com', contraseña: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Registro exitoso. Ahora inicia sesión.");

    // Verificar que hash fue llamado
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);

    // Verificar que db.query fue llamado con el INSERT
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO usuarios (nombre, correo, contraseña, fecha_registro) VALUES (?, ?, ?, ?)',
      expect.arrayContaining(['Nuevo', 'nuevo@mail.com', 'hashedPassword123', expect.any(String)])
    );
  });

  test('debería rechazar si el correo ya existe', async () => {
    db.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]); // correo ya existe

    const res = await request(app)
      .post('/registrar')
      .send({ nombre_usuario: 'Test', correo: 'existe@mail.com', contraseña: '123456' });

    expect(res.status).toBe(200); // la ruta responde con 200 pero success = false
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Este correo ya ha sido registrado");
  });

  test('debería manejar error del servidor', async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .post('/registrar')
      .send({ nombre_usuario: 'Error', correo: 'error@mail.com', contraseña: '123456' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Error en el servidor");
  });
});
