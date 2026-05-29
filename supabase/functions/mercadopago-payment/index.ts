import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Configuración de Mercado Pago
const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") || "";
const MERCADOPAGO_PUBLIC_KEY = "APP_USR-d74250de-58cc-4c7f-9ac3-371dba00380d";
const SUPABASE_PROJECT_ID = "acapurizimtptybtjcbe";

// Inicializar cliente de Supabase
const supabase = createClient(
  `https://${SUPABASE_PROJECT_ID}.supabase.co`,
  Deno.env.get("SUPABASE_ANON_KEY") || ""
);

interface ItemPedido {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  icono: string;
}

interface ClienteData {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  "codigo-postal": string;
  documento: string;
}

interface Pedido {
  cliente: ClienteData;
  items: ItemPedido[];
  subtotal: number;
  envio: number;
  total: number;
  timestamp: string;
}

// Función para crear preferencia en Mercado Pago
async function crearPreferenciaMercadoPago(pedido: Pedido) {
  const items = pedido.items.map((item) => ({
    title: item.nombre,
    description: `Cantidad: ${item.cantidad}`,
    quantity: item.cantidad,
    unit_price: Math.round(item.precio * 100) / 100,
    currency_id: "ARS",
  }));

  // Agregar envío como item
  items.push({
    title: "Envío",
    description: "Costo de envío",
    quantity: 1,
    unit_price: Math.round(pedido.envio * 100) / 100,
    currency_id: "ARS",
  });

  const preferencia = {
    items: items,
    payer: {
      name: pedido.cliente.nombre.split(" ")[0],
      surname: pedido.cliente.nombre.split(" ").slice(1).join(" "),
      email: pedido.cliente.email,
      phone: {
        area_code: "54",
        number: pedido.cliente.telefono,
      },
      address: {
        street_name: pedido.cliente.direccion,
        street_number: 0,
        zip_code: pedido.cliente["codigo-postal"],
      },
    },
    back_urls: {
      success: `https://${SUPABASE_PROJECT_ID}.supabase.co/success`,
      failure: `https://${SUPABASE_PROJECT_ID}.supabase.co/failure`,
      pending: `https://${SUPABASE_PROJECT_ID}.supabase.co/pending`,
    },
    auto_return: "approved",
    external_reference: `ORDEN-${Date.now()}`,
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(preferencia),
  });

  if (!response.ok) {
    throw new Error(`Error de Mercado Pago: ${response.statusText}`);
  }

  return await response.json();
}

// Función para guardar pedido en Supabase
async function guardarPedidoEnSupabase(pedido: Pedido, preferenceId: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .insert([
      {
        cliente_nombre: pedido.cliente.nombre,
        cliente_email: pedido.cliente.email,
        cliente_telefono: pedido.cliente.telefono,
        cliente_documento: pedido.cliente.documento,
        direccion: pedido.cliente.direccion,
        ciudad: pedido.cliente.ciudad,
        provincia: pedido.cliente.provincia,
        codigo_postal: pedido.cliente["codigo-postal"],
        items: pedido.items,
        subtotal: pedido.subtotal,
        envio: pedido.envio,
        total: pedido.total,
        mercadopago_preference_id: preferenceId,
        estado: "pendiente",
        created_at: pedido.timestamp,
      },
    ]);

  if (error) {
    console.error("Error al guardar pedido:", error);
    throw error;
  }

  return data;
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método no permitido" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const pedido: Pedido = await req.json();

    // Validar datos del pedido
    if (!pedido.cliente || !pedido.items || pedido.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Datos del pedido inválidos" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Crear preferencia en Mercado Pago
    const preferencia = await crearPreferenciaMercadoPago(pedido);

    // Guardar pedido en Supabase
    await guardarPedidoEnSupabase(pedido, preferencia.id);

    // Retornar URL de redirección
    return new Response(
      JSON.stringify({
        success: true,
        preferenceId: preferencia.id,
        redirectUrl: preferencia.init_point,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error en mercadopago-payment:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error interno del servidor",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
