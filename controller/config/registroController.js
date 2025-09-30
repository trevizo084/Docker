const express = require("express");
const router = express.Router();
const db = require("./dbsettings"); 
const { format } = require("date-fns");
const bcrypt = require("bcrypt");

router.post("/registrar", async (req, res) => {
    const { nombre_usuario, contraseña, correo } = req.body;
    let fecha = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const checkEmailQuery = 'SELECT * FROM usuarios WHERE correo = ?';
    const insertUserQuery = 'INSERT INTO usuarios (nombre, correo, contraseña, fecha_registro) VALUES (?, ?, ?, ?)';

    try {
        // Verificar si el correo ya existe
        const [emailResults] = await db.query(checkEmailQuery, [correo]);
        if (emailResults.length > 0) {
            return res.json({ success: false, error: "Este correo ya ha sido registrado" });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar usuario
        await db.query(insertUserQuery, [nombre_usuario, correo, hashedPassword, fecha]);

        // Responder con éxito 
        res.json({ success: true, message: "Registro exitoso. Ahora inicia sesión." });

    } catch (err) {
        console.error("Error en la consulta:", err);
        res.status(500).json({ success: false, error: "Error en el servidor" });
    }
});

module.exports = router;
