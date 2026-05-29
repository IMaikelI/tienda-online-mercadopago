// Catálogo de productos
const PRODUCTOS = [
    {
        id: 1,
        nombre: 'Laptop Dell XPS',
        descripcion: 'Laptop de 15 pulgadas, Intel i7',
        precio: 1299.99,
        icono: '💻'
    },
    {
        id: 2,
        nombre: 'iPhone 15 Pro',
        descripcion: 'Smartphone último modelo',
        precio: 999.99,
        icono: '📱'
    },
    {
        id: 3,
        nombre: 'Headphones Sony WH-1000',
        descripcion: 'Auriculares con cancelación de ruido',
        precio: 349.99,
        icono: '🎧'
    },
    {
        id: 4,
        nombre: 'Tablet Samsung Galaxy',
        descripcion: 'Tablet 11 pulgadas con S-Pen',
        precio: 799.99,
        icono: '📲'
    },
    {
        id: 5,
        nombre: 'Smartwatch Apple Watch',
        descripcion: 'Reloj inteligente Ultra',
        precio: 429.99,
        icono: '⌚'
    },
    {
        id: 6,
        nombre: 'Cámara Canon EOS',
        descripcion: 'Cámara DSLR profesional',
        precio: 1599.99,
        icono: '📷'
    },
    {
        id: 7,
        nombre: 'Monitor LG 4K',
        descripcion: 'Monitor 27 pulgadas 4K UHD',
        precio: 599.99,
        icono: '🖥️'
    },
    {
        id: 8,
        nombre: 'SSD Crucial 1TB',
        descripcion: 'Unidad de estado sólido NVMe',
        precio: 89.99,
        icono: '💾'
    }
];

// Función para renderizar los productos
function renderizarProductos() {
    const productosGrid = document.getElementById('productos-grid');
    
    if (!productosGrid) return;
    
    productosGrid.innerHTML = PRODUCTOS.map(producto => `
        <div class="producto-card">
            <div class="producto-imagen">${producto.icono}</div>
            <div class="producto-info">
                <div class="producto-nombre">${producto.nombre}</div>
                <div class="producto-descripcion">${producto.descripcion}</div>
                <div class="producto-precio">$${producto.precio.toFixed(2)}</div>
                <div class="producto-footer">
                    <button class="btn btn-primary" onclick="agregarAlCarrito(${producto.id})">Agregar</button>
                    <button class="btn btn-secondary" onclick="verDetalles(${producto.id})">Ver</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Obtener producto por ID
function obtenerProducto(id) {
    return PRODUCTOS.find(p => p.id === id);
}

// Ver detalles del producto (placeholder)
function verDetalles(id) {
    const producto = obtenerProducto(id);
    alert(`Detalles de ${producto.nombre}\n\n${producto.descripcion}\n\nPrecio: $${producto.precio.toFixed(2)}`);
}

// Inicializar productos cuando carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarProductos);
} else {
    renderizarProductos();
}
