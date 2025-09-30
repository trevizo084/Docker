const express = require('express');
const router = express.Router();
const db = require('./dbsettings');
const { verifyToken } = require('./logincontroller');

// Mostrar carrito
router.get('/', verifyToken, async (req, res) => {
    let cartItems = []; 
    try {
        const userId = req.session.user.id;
        if (!userId) {
            return res.redirect('/'); 
        }

        const query = `
            SELECT c.id_carrito, c.id_producto, p.nombre, p.precio, c.cantidad, p.stock, p.imegen_producto
            FROM carrito c
            JOIN productos p ON c.id_producto = p.id_producto
            WHERE c.id_usuario = ?
        `;

        [cartItems] = await db.query(query, [userId]);

        

        res.render('carrito', { cartItems });

    } catch (err) {
        console.error('Error al obtener carrito:', err);
        res.render('carrito', { cartItems: [] });
    }
});

// Agregar producto al carrito
router.post('/agregar', verifyToken , async (req, res) => {
    console.log("Body recibido:", req.body);
    const { id_producto, cantidad } = req.body;
    const userId = req.session.user.id;

    try {
        // Verificar stock disponible
        const [product] = await db.query(
            'SELECT stock FROM productos WHERE id_producto = ?',
            [id_producto]
        );
        
        if (product.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        const stockDisponible = product[0].stock;
        
        // Verificar si el producto ya está en el carrito
        const [existing] = await db.query(
            'SELECT * FROM carrito WHERE id_usuario = ? AND id_producto = ?',
            [userId, id_producto]
        );

        let cantidadEnCarrito = 0;
        if (existing.length > 0) {
            cantidadEnCarrito = existing[0].cantidad;
        }
        
        // Verificar si hay suficiente stock
        if (cantidadEnCarrito + cantidad > stockDisponible) {
            return res.status(409).json({ 
                error: "No hay suficiente stock disponible", 
                stockDisponible: stockDisponible 
            });
        }

        if (existing.length > 0) {
            await db.query(
                'UPDATE carrito SET cantidad = cantidad + ? WHERE id_carrito = ?',
                [cantidad, existing[0].id_carrito]
            );
        } else {
            await db.query(
                'INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)',
                [userId, id_producto, cantidad]
            );
        }

        res.redirect('/carrito');

    } catch (err) {
        console.error('Error al agregar producto:', err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Actualizar cantidad en carrito
router.put('/update/:productId', verifyToken, async (req, res) => {
    const userId = req.session.user.id;
    const { productId } = req.params;
    const { cantidad } = req.body || {};

    console.log("Body recibido en PUT:", req.body);

    if (!cantidad || cantidad < 0) {
        return res.status(400).json({ error: "Cantidad inválida" });
    }

    try {
        // Verificar stock disponible
        const [product] = await db.query(
            'SELECT stock FROM productos WHERE id_producto = ?',
            [productId]
        );
        
        if (product.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        const stockDisponible = product[0].stock;
        
        // Verificar si hay suficiente stock
        if (cantidad > stockDisponible) {
            return res.status(409).json({ 
                error: "No hay suficiente stock disponible", 
                stockDisponible: stockDisponible 
            });
        }

        if (cantidad === 0) {
            // Eliminar producto si la cantidad es 0
            await db.query(
                'DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?',
                [userId, productId]
            );
            return res.json({ message: "Producto eliminado del carrito" });
        } else {
            await db.query(
                'UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?',
                [cantidad, userId, productId]
            );
            return res.json({ message: "Cantidad actualizada" });
        }
    } catch (err) {
        console.error('Error al actualizar cantidad:', err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Finalizar compra (actualizar stock)
router.post('/comprar',verifyToken, async (req, res) => {
    const userId = req.session.user.id;

    try {
        // Obtener todos los productos del carrito
        const [cartItems] = await db.query(
            `SELECT c.id_producto, c.cantidad, p.stock 
             FROM carrito c 
             JOIN productos p ON c.id_producto = p.id_producto 
             WHERE c.id_usuario = ?`,
            [userId]
        );

        // Verificar stock antes de procesar la compra
        for (const item of cartItems) {
            if (item.cantidad > item.stock) {
                return res.status(409).json({ 
                    error: `No hay suficiente stock para el producto ID: ${item.id_producto}` 
                });
            }
        }

        // Actualizar stock y vaciar carrito (usando transacción)
        await db.query('START TRANSACTION');
        
        for (const item of cartItems) {
            // Actualizar stock
            await db.query(
                'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );
        }
        
        // Vaciar carrito
        await db.query('DELETE FROM carrito WHERE id_usuario = ?', [userId]);
        
        await db.query('COMMIT');
        
        res.json({ success: true, message: "Compra realizada con éxito" });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error al procesar compra:', err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Eliminar producto del carrito
router.delete('/remove/:productId',verifyToken, async (req, res) => {
    const userId = req.session.user.id;
    const { productId } = req.params;

    try {
        await db.query(
            'DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?',
            [userId, productId]
        );
        res.json({ message: "Producto eliminado" });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Vaciar carrito
router.delete('/clear', verifyToken , async (req, res) => {
    const userId = req.session.user.id;

    try {
        await db.query('DELETE FROM carrito WHERE id_usuario = ?', [userId]);
        res.json({ message: "Carrito vaciado" });
    } catch (err) {
        console.error('Error al vaciar carrito:', err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

module.exports = router;