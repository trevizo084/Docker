jest.mock('mysql2/promise', () => ({
  createPool: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue([[{ result: 2 }], []]),
    end: jest.fn().mockResolvedValue()
  })
}));

const db = require('../controller/config/dbsettings');

describe('DB Settings (unitaria)', () => {
  test('createPool debería configurarse con variables de entorno', async () => {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    expect(rows[0].result).toBe(2);
  });

  test('debería permitir cerrar la conexión', async () => {
    await expect(db.end()).resolves.not.toThrow();
  });
});
