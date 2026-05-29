# Tienda Online con Mercado Pago

Tienda online básica integrada con Mercado Pago para procesamiento de pagos.

## 🚀 Características

✅ **Catálogo de Productos** - 8 productos de ejemplo
✅ **Carrito de Compras** - Persistencia con LocalStorage
✅ **Checkout Completo** - Formulario con validaciones
✅ **Integración Mercado Pago** - Procesamiento de pagos
✅ **Edge Functions Supabase** - Backend sin servidor
✅ **Base de Datos** - Almacenamiento de pedidos

## 📁 Estructura del Proyecto

```
tienda-online-mercadopago/
├── index.html                 # Página principal
├── checkout.html              # Página de checkout
├── css/
│   └── style.css              # Estilos globales
├── js/
│   ├── productos.js           # Catálogo de productos
│   ├── carrito.js             # Gestión del carrito
│   ├── checkout.js            # Validaciones del checkout
│   ├── mercadopago.js         # Integración MP
│   └── main.js                # Script principal
├── supabase/
│   └── functions/
│       └── mercadopago-payment/
│           └── index.ts       # Edge Function para pagos
├── .env.example               # Variables de entorno
└── README.md                  # Este archivo
```

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/IMaikelI/tienda-online-mercadopago.git
cd tienda-online-mercadopago
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
SUPABASE_URL=https://acapurizimtptybtjcbe.supabase.co
SUPABASE_ANON_KEY=tu_clave_aqui
SUPABASE_PROJECT_ID=acapurizimtptybtjcbe
MERCADOPAGO_PUBLIC_KEY=APP_USR-d74250de-58cc-4c7f-9ac3-371dba00380d
MERCADOPAGO_ACCESS_TOKEN=tu_token_aqui
```

### 3. Configurar Base de Datos

En Supabase, crear tabla `pedidos`:

```sql
CREATE TABLE pedidos (
  id BIGSERIAL PRIMARY KEY,
  cliente_nombre VARCHAR(255),
  cliente_email VARCHAR(255),
  cliente_telefono VARCHAR(20),
  cliente_documento VARCHAR(50),
  direccion VARCHAR(255),
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  codigo_postal VARCHAR(10),
  items JSONB,
  subtotal DECIMAL(10, 2),
  envio DECIMAL(10, 2),
  total DECIMAL(10, 2),
  mercadopago_preference_id VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Deploy de Edge Function

```bash
supabase functions deploy mercadopago-payment
```

## 📝 Validaciones del Checkout

- ✓ Nombre mínimo 3 caracteres
- ✓ Email válido
- ✓ Teléfono mínimo 7 dígitos
- ✓ Dirección mínimo 5 caracteres
- ✓ Ciudad y provincia obligatorias
- ✓ Código postal numérico
- ✓ Documento obligatorio
- ✓ Aceptación de términos y privacidad

## 🛒 Flujo de Compra

1. **Explorar Catálogo** → Index.html
2. **Agregar Productos** → Carrito (LocalStorage)
3. **Ver Carrito** → Modal con opciones
4. **Ir a Checkout** → checkout.html
5. **Completar Formulario** → Validaciones
6. **Procesar Pago** → Edge Function Supabase
7. **Redirect Mercado Pago** → Pago
8. **Confirmación** → Pedido guardado en DB

## 💳 Credenciales de Prueba Mercado Pago

- **Email**: Usa tu email de prueba
- **Tarjeta**: 4111 1111 1111 1111
- **Vencimiento**: 11/25
- **CVV**: 123

## 🔐 Claves Proporcionadas

```
SUPABASE_ANON_KEY:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjYXB1cml6aW10cHR5YnRqY2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDQ3MzQsImV4cCI6MjA5MTE4MDczNH0.Rx1sjaN8nNLDo8Eenbi-P4y6dtxI5MM4GV3vaAonQ2o

MERCADOPAGO_PUBLIC_KEY:
APP_USR-d74250de-58cc-4c7f-9ac3-371dba00380d
```

## 🚀 Deployment

### Opción 1: Vercel
```bash
vercel
```

### Opción 2: Netlify
```bash
netlify deploy
```

## 📚 Documentación

- [Mercado Pago Docs](https://www.mercadopago.com.ar/developers/en/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT

## 👨‍💻 Autor

IMaikelI

## 📞 Soporte

Para preguntas o problemas, abre un issue en el repositorio.
