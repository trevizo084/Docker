// __tests__/sessioncontroller.test.js
jest.mock('express-session', () => jest.fn(() => (req, res, next) => next()));

// Mock de dotenv si es necesario
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

const session = require('express-session');

describe('Session Middleware', () => {
  beforeEach(() => {
    // Configura variables de entorno para el test
    process.env.SESSION_SECRETKEY = '1234567890abcdefg';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('debería llamar a express-session con la configuración correcta', () => {
    // Requerir el módulo después de configurar los mocks
    require('../controller/config/sessioncontroller');
    
    expect(session).toHaveBeenCalledWith({
      secret: '1234567890abcdefg',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 86400000, secure: false }
    });
  });
});