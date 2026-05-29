// Gestión del carrito
class Carrito {
    constructor() {
        this.items = this.cargarDelLocalStorage();
    }

    cargarDelLocalStorage() {
        const datos = localStorage.getItem('carrito');
        return datos ? JSON.parse(datos) : [];
    }

    guardarEnLocalStorage() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
    }

    agregarItem(productId) {
        const producto = obtenerProducto(productId);
        if (!producto) return;

        const itemExistente = this.items.find(item => item.id === productId);
        
        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            this.items.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1,
                icono: producto.icono
            });
        }
        
        this.guardarEnLocalStorage();
        this.actualizarUI();
    }

    eliminarItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.guardarEnLocalStorage();
        this.actualizarUI();
    }

    actualizarCantidad(productId, cantidad) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.cantidad = Math.max(1, cantidad);
            this.guardarEnLocalStorage();
            this.actualizarUI();
        }
    }

    vaciar() {
        this.items = [];
        this.guardarEnLocalStorage();
        this.actualizarUI();
    }

    obtenerTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    obtenerCantidadTotal() {
        return this.items.reduce((total, item) => total + item.cantidad, 0);
    }

    actualizarUI() {
        this.actualizarBadgeCarrito();
        this.renderizarCarrito();
    }

    actualizarBadgeCarrito() {
        const badge = document.getElementById('carrito-count');
        if (badge) {
            badge.textContent = this.obtenerCantidadTotal();
        }
    }

    renderizarCarrito() {
        const carritoItems = document.getElementById('carrito-items');
        if (!carritoItems) return;

        if (this.items.length === 0) {
            carritoItems.innerHTML = '<div class="carrito-vacio">El carrito está vacío</div>';
            const checkoutBtn = document.getElementById('checkout-btn');
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        carritoItems.innerHTML = this.items.map(item => `
            <div class="carrito-item">
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.icono} ${item.nombre}</div>
                    <div class="carrito-item-cantidad">
                        Cantidad: 
                        <input type="number" min="1" value="${item.cantidad}" 
                               onchange="carrito.actualizarCantidad(${item.id}, this.value)" 
                               style="width: 50px; padding: 5px;">
                    </div>
                </div>
                <div class="carrito-item-precio">$${(item.precio * item.cantidad).toFixed(2)}</div>
                <button class="carrito-item-remove" onclick="carrito.eliminarItem(${item.id})">✕</button>
            </div>
        `).join('');

        const total = document.getElementById('carrito-total');
        if (total) total.textContent = this.obtenerTotal().toFixed(2);

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) checkoutBtn.disabled = false;
    }
}

// Instancia global del carrito
const carrito = new Carrito();

// Función para agregar al carrito
function agregarAlCarrito(productId) {
    carrito.agregarItem(productId);
    mostrarNotificacion(`Producto agregado al carrito!`);
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo}`;
    notificacion.textContent = mensaje;
    notificacion.style.position = 'fixed';
    notificacion.style.top = '80px';
    notificacion.style.right = '20px';
    notificacion.style.zIndex = '9999';
    notificacion.style.minWidth = '300px';
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

// Manejadores del modal
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('carrito-modal');
        const carritoBtn = document.getElementById('carrito-btn');
        const closeBtn = document.querySelector('.close');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (carritoBtn) {
            carritoBtn.addEventListener('click', () => {
                if (modal) modal.classList.add('active');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (modal) modal.classList.remove('active');
            });
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = 'checkout.html';
            });
        }

        // Cerrar modal al hacer click fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        carrito.actualizarUI();
    });
} else {
    carrito.actualizarUI();
}
