const express = require("express");
const router = express.Router();
const db = require("./dbsettings");
const { verifyToken } = require("./logincontroller");

router.get("/", (req, res) => {
    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null; 
    res.render("login", { errorMessage });
});

router.get("/registro", (req, res) => {
    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null; 
    res.render("registro", { errorMessage });
});

router.get("/perfil",verifyToken, async (req, res) => {
    try {
        
        const query = "SELECT correo, foto_perfil, fecha_registro FROM usuarios WHERE id_usuario = ?";
        const [results] = await db.query(query, [req.session.user.id]);

        if (results.length > 0) {
            const user = {
                nombre: req.session.user.nombre,
                correo: results[0].correo,
                fecha_registro: results[0].fecha_registro,
                pfp: results[0].foto_perfil || null
            };
            res.render("perfil", { user });
        } else {
            req.session.errorMessage = "Usuario no encontrado";
            res.redirect("/");
        }
    } catch (err) {
        console.error("Error al consultar la base de datos:", err);
        req.session.errorMessage = "Error en el servidor";
        res.redirect("/");
    }
});

router.get("/productos",verifyToken, async (req, res) => {
    try {
       
        const query = "SELECT id_producto, nombre, descripcion, precio, stock, imegen_producto FROM productos";
        const [products] = await db.query(query);

       
        res.render("productos", { user: req.session.user, products });
    } catch (err) {
        console.error("Error al consultar los productos:", err);
        res.redirect("/index");
    }
});



module.exports = router;