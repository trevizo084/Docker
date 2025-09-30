document.addEventListener('DOMContentLoaded', () => {
    // Login con credenciales
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            correo: document.getElementById('correo').value,
            contraseña: document.getElementById('contraseña').value
        };

        try {
            const response = await fetch('/iniciosesion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                // Guardar token
                localStorage.setItem('jwtToken', data.token);
                console.log(" Token recibido (credenciales):", data.token);
                window.location.href = '/productos';
            } else {
                showError('errorMessage', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('errorMessage', 'Error de conexión');
        }
    });

    // Verificar si hay token al cargar la página
    window.addEventListener('load', () => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            console.log("Token almacenado:", token);
        }
    });

    // Función auxiliar
    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = '#d32f2f';
    }
});
