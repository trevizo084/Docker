const express = require("express");
const router = express.Router();
const db = require("./dbsettings");

router.post("/perfil/editar", async (req, res) => {
    const { nombre, pfp } = req.body;

    try {
        const query = "UPDATE usuarios SET nombre = ?, foto_perfil = ? WHERE id_usuario = ?";
        await db.query(query, [nombre, pfp, req.session.user.id]);

        req.session.user.nombre = nombre;
        req.session.user.pfp = pfp;

        res.redirect("/perfil");
    } catch (err) {
        console.error("Error al actualizar el perfil:", err);
        req.session.errorMessage = "Error al actualizar el perfil";
        res.redirect("/perfil");
    }
});

module.exports = router;