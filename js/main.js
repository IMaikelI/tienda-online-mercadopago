// Script principal de inicialización

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tienda Online - Inicializada');
    
    // Verificar soporte de localStorage
    if (!window.localStorage) {
        console.warn('localStorage no disponible');
    }
});

// Función auxiliar para verificar estado del usuario
function verificarUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

// Función para guardar usuario
function guardarUsuario(datos) {
    localStorage.setItem('usuario', JSON.stringify(datos));
}

// Manejo de errores global
window.addEventListener('error', (evento) => {
    console.error('Error global:', evento.error);
});

// Manejo de promesas rechazadas
window.addEventListener('unhandledrejection', (evento) => {
    console.error('Promesa rechazada:', evento.reason);
});
