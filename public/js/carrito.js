// Función para mostrar mensajes
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.textContent = message;
    alertDiv.className = `alert-message alert-${type}`;
    alertDiv.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 5000);
}

// Aumentar cantidad
document.querySelectorAll(".btn-sumar").forEach(btn => {
    btn.addEventListener("click", async (e) => {
        const row = e.target.closest(".cart-item");
        const productId = row.dataset.id;
        const currentQuantity = parseInt(row.dataset.cantidad);
        const availableStock = parseInt(row.dataset.stock);
        
        if (currentQuantity >= availableStock) {
            showAlert("No hay suficiente stock disponible", "error");
            return;
        }
        
        const newQuantity = currentQuantity + 1;

        const res = await fetch(`/carrito/update/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cantidad: newQuantity })
        });

        const data = await res.json();
        if (res.ok) {
            window.location.reload();
        } else {
            showAlert(data.error || "Error al actualizar", "error");
        }
    });
});

// Disminuir cantidad
document.querySelectorAll(".btn-restar").forEach(btn => {
    btn.addEventListener("click", async (e) => {
        const row = e.target.closest(".cart-item");
        const productId = row.dataset.id;
        const currentQuantity = parseInt(row.dataset.cantidad);
        
        const newQuantity = currentQuantity - 1;

        const res = await fetch(`/carrito/update/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cantidad: newQuantity })
        });

        const data = await res.json();
        if (res.ok) {
            window.location.reload();
        } else {
            showAlert(data.error || "Error al actualizar", "error");
        }
    });
});

// Eliminar producto
document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", async (e) => {
        const row = e.target.closest(".cart-item");
        const productId = row.dataset.id;

        const res = await fetch(`/carrito/remove/${productId}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
            window.location.reload();
        } else {
            showAlert(data.error || "Error al eliminar", "error");
        }
    });
});

// Vaciar carrito
document.getElementById("vaciarCarrito")?.addEventListener("click", async () => {
    if (!confirm("¿Estás seguro de que quieres vaciar el carrito?")) return;
    
    const res = await fetch(`/carrito/clear`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
        window.location.reload();
    } else {
        showAlert(data.error || "Error al vaciar carrito", "error");
    }
});

// Finalizar compra
document.getElementById("finalizarCompra")?.addEventListener("click", async () => {
    if (!confirm("¿Confirmar compra? Esta acción no se puede deshacer.")) return;
    
    const res = await fetch(`/carrito/comprar`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    
    const data = await res.json();
    if (res.ok) {
        showAlert("¡Compra realizada con éxito!", "success");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        showAlert(data.error || "Error al procesar la compra", "error");
    }
});
