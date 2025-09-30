const express = require("express");
const router = express.Router();
const db = require("./dbsettings");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const JWT_SECRET =  process.env.JWT_SECRET || "mi_clave_supersecreta";


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      
      const [results] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [profile.emails[0].value]);
      
      if (results.length > 0) {
        return done(null, results[0]);
      } else {
        
        const newUser = {
          nombre: profile.displayName,
          correo: profile.emails[0].value,
          contraseña: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
          foto_perfil: profile.photos[0].value
        };
        
        const [insertResult] = await db.query(
          'INSERT INTO usuarios (nombre, correo, contraseña, foto_perfil) VALUES (?, ?, ?, ?)',
          [newUser.nombre, newUser.correo, newUser.contraseña, newUser.foto_perfil]
        );
        
        newUser.id_usuario = insertResult.insertId;
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id_usuario);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [results] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id]);
    done(null, results[0]);
  } catch (error) {
    done(error, null);
  }
});

// Login normal
router.post("/iniciosesion", async (req, res) => {
  const { correo, contraseña } = req.body;

  const query = 'SELECT * FROM usuarios WHERE correo = ?';

  try {
    const [results] = await db.query(query, [correo]);

    if (results.length === 0) {
      console.error("Error: usuario no encontrado"); 
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = results[0];

    // Validar contraseña con bcrypt
    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) {
      console.error("Error: contraseña inválida");
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Token generado (login credenciales):", token);

    // Guardar token en sesión
    req.session.token = token;
    req.session.user = {
      id: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo
    };

    // Devolver token para API (Postman, frontend)
    return res.json({ 
      success: true, 
      token: token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo
      }
    });

  } catch (err) {
    console.log("Error en la consulta:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Rutas para OAuth Google
router.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    
    const token = jwt.sign(
      {
        id: req.user.id_usuario,
        nombre: req.user.nombre,
        correo: req.user.correo,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Token generado (Google):", token);
    
    // Guardar en sesión
    req.session.token = token;
    req.session.user = {
      id: req.user.id_usuario,
      nombre: req.user.nombre,
      correo: req.user.correo
    };
    
    // Redirigir a productos
    res.redirect('/productos');
  }
);



// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.session.token;
  
  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};


// ruta para cerrar sesión
router.get("/logout", (req, res) => {
  // Eliminar el token del localStorage del cliente
  const logoutScript = `
    <script>
      localStorage.removeItem('jwtToken');
      window.location.href = '/';
    </script>
  `;
  
  // Destruir la sesión del servidor
  req.session.destroy((err) => {
    if (err) {
      console.log("Error al cerrar sesión:", err);
      return res.status(500).send("Error al cerrar sesión. " + logoutScript);
    }
    
    // Limpiar la cookie de sesión manualmente
    res.clearCookie('connect.sid');
    
    // Enviar respuesta con script para limpiar localStorage y redirigir
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cerrando sesión...</title>
      </head>
      <body>
        <p>Cerrando sesión, por favor espere...</p>
        ${logoutScript}
      </body>
      </html>
    `);
  });
});

module.exports = { router, verifyToken };