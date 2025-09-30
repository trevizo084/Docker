const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");



const app = express();
const port = process.env.PORT || 3000;
const registrarController = require("./controller/config/registroController");
const rutasController = require("./controller/config/rutascontroller");
const sessionMiddleware = require("./controller/config/sessioncontroller");
const { router: loginController, verifyToken} = require("./controller/config/logincontroller");
const carritocontroller = require("./controller/config/carritocontroller");
const perfilController = require("./controller/config/perfilContoller");



const fs = require("fs");

//variables de entorno
dotenv.config();

app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(registrarController);
app.use(rutasController);
app.use(loginController);
app.use(perfilController);
app.use('/carrito', carritocontroller);


//manejo de errores de la pagina
app.use((req, res) => {
    res.status(404).render("404");
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto:http://localhost:${port}`);
});

