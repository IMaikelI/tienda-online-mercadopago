// Configuración de envío
const COSTO_ENVIO = 9.99;

// Clase para manejar validaciones
class ValidadorCheckout {
    constructor() {
        this.errores = {};
    }

    limpiarErrores() {
        this.errores = {};
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('has-error');
        });
        document.querySelectorAll('.error').forEach(error => {
            error.textContent = '';
        });
    }

    validarNombre(nombre) {
        if (!nombre || nombre.trim().length < 3) {
            this.errores['nombre'] = 'El nombre debe tener al menos 3 caracteres';
            return false;
        }
        return true;
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !regex.test(email)) {
            this.errores['email'] = 'Ingrese un email válido';
            return false;
        }
        return true;
    }

    validarTelefono(telefono) {
        const regex = /^[0-9]{7,}$/;
        if (!telefono || !regex.test(telefono.replace(/[\s-()]/g, ''))) {
            this.errores['telefono'] = 'Ingrese un teléfono válido (mínimo 7 dígitos)';
            return false;
        }
        return true;
    }

    validarDireccion(direccion) {
        if (!direccion || direccion.trim().length < 5) {
            this.errores['direccion'] = 'Ingrese una dirección válida';
            return false;
        }
        return true;
    }

    validarCiudad(ciudad) {
        if (!ciudad || ciudad.trim().length < 2) {
            this.errores['ciudad'] = 'Ingrese una ciudad válida';
            return false;
        }
        return true;
    }

    validarProvincia(provincia) {
        if (!provincia || provincia.trim().length < 2) {
            this.errores['provincia'] = 'Ingrese una provincia válida';
            return false;
        }
        return true;
    }

    validarCodigoPostal(codigoPostal) {
        const regex = /^[0-9]{4,}$/;
        if (!codigoPostal || !regex.test(codigoPostal)) {
            this.errores['codigo-postal'] = 'Ingrese un código postal válido';
            return false;
        }
        return true;
    }

    validarDocumento(documento) {
        if (!documento || documento.trim().length < 5) {
            this.errores['documento'] = 'Ingrese un documento válido';
            return false;
        }
        return true;
    }

    validarTerminos(terminos) {
        if (!terminos) {
            this.errores['terminos'] = 'Debe aceptar los términos y condiciones';
            return false;
        }
        return true;
    }

    validarPrivacidad(privacidad) {
        if (!privacidad) {
            this.errores['privacidad'] = 'Debe aceptar la política de privacidad';
            return false;
        }
        return true;
    }

    validarFormulario(datos) {
        this.limpiarErrores();

        this.validarNombre(datos.nombre);
        this.validarEmail(datos.email);
        this.validarTelefono(datos.telefono);
        this.validarDireccion(datos.direccion);
        this.validarCiudad(datos.ciudad);
        this.validarProvincia(datos.provincia);
        this.validarCodigoPostal(datos['codigo-postal']);
        this.validarDocumento(datos.documento);
        this.validarTerminos(datos.terminos);
        this.validarPrivacidad(datos.privacidad);

        return Object.keys(this.errores).length === 0;
    }

    mostrarErrores() {
        for (const [campo, mensaje] of Object.entries(this.errores)) {
            const errorElement = document.getElementById(`error-${campo}`);
            const inputElement = document.getElementById(campo);
            
            if (errorElement) {
                errorElement.textContent = mensaje;
            }
            
            if (inputElement && inputElement.closest('.form-group')) {
                inputElement.closest('.form-group').classList.add('has-error');
            }
        }
    }
}

// Clase para manejar el resumen del pedido
class ResumenPedido {
    constructor() {
        this.cargarDeCarrito();
        this.renderizar();
    }

    cargarDeCarrito() {
        this.items = carrito.items;
        this.subtotal = carrito.obtenerTotal();
        this.envio = COSTO_ENVIO;
        this.total = this.subtotal + this.envio;
    }

    renderizar() {
        this.renderizarItems();
        this.renderizarTotales();
    }

    renderizarItems() {
        const summaryItems = document.getElementById('summary-items');
        if (!summaryItems) return;

        summaryItems.innerHTML = this.items.map(item => `
            <div class="summary-item">
                <div class="summary-item-info">
                    <div class="summary-item-nombre">${item.icono} ${item.nombre}</div>
                    <div class="summary-item-cantidad">Cantidad: ${item.cantidad}</div>
                </div>
                <div class="summary-item-precio">$${(item.precio * item.cantidad).toFixed(2)}</div>
            </div>
        `).join('');
    }

    renderizarTotales() {
        const subtotal = document.getElementById('subtotal');
        const envio = document.getElementById('envio');
        const totalFinal = document.getElementById('total-final');

        if (subtotal) subtotal.textContent = this.subtotal.toFixed(2);
        if (envio) envio.textContent = this.envio.toFixed(2);
        if (totalFinal) totalFinal.textContent = this.total.toFixed(2);
    }
}

// Función para obtener datos del formulario
function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        ciudad: document.getElementById('ciudad').value,
        provincia: document.getElementById('provincia').value,
        'codigo-postal': document.getElementById('codigo-postal').value,
        documento: document.getElementById('documento').value,
        terminos: document.getElementById('terminos').checked,
        privacidad: document.getElementById('privacidad').checked
    };
}

// Función para procesar el pago
async function procesarPago() {
    const validador = new ValidadorCheckout();
    const datos = obtenerDatosFormulario();

    if (!validador.validarFormulario(datos)) {
        validador.mostrarErrores();
        mostrarNotificacion('Por favor, corrija los errores en el formulario', 'danger');
        return;
    }

    const pagarBtn = document.getElementById('pagar-btn');
    pagarBtn.disabled = true;
    pagarBtn.textContent = 'Procesando...';

    try {
        const resumen = new ResumenPedido();
        
        // Preparar datos para enviar a la Edge Function
        const pedido = {
            cliente: datos,
            items: carrito.items,
            subtotal: resumen.subtotal,
            envio: resumen.envio,
            total: resumen.total,
            timestamp: new Date().toISOString()
        };

        // Llamar a la Edge Function de Supabase
        const respuesta = await fetch('/api/mercadopago-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedido)
        });

        const resultado = await respuesta.json();

        if (resultado.success && resultado.redirectUrl) {
            // Guardar la orden antes de redirigir
            localStorage.setItem('ultimaPedido', JSON.stringify(pedido));
            // Redirigir a Mercado Pago
            window.location.href = resultado.redirectUrl;
        } else {
            throw new Error(resultado.error || 'Error al procesar el pago');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(`Error: ${error.message}`, 'danger');
        pagarBtn.disabled = false;
        pagarBtn.textContent = 'Proceder al Pago';
    }
}

// Inicialización cuando carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Verificar si hay items en el carrito
        if (carrito.items.length === 0) {
            mostrarNotificacion('El carrito está vacío', 'warning');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        // Renderizar resumen
        const resumen = new ResumenPedido();

        // Manejador del formulario
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }

        // Manejador del botón de pago
        const pagarBtn = document.getElementById('pagar-btn');
        if (pagarBtn) {
            pagarBtn.addEventListener('click', procesarPago);
        }
    });
}
