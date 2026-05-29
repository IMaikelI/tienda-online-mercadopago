import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;

serve(async (req) => {
  // CORS para que el frontend pueda llamarla
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const body = await req.json();
    
    // Validar que tengamos los datos necesarios
    if (!body.cliente || !body.items || !Array.isArray(body.items)) {
      return new Response(
        JSON.stringify({ error: "Datos inválidos del pedido" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Construir items para Mercado Pago
    const items = body.items.map((item: any) => ({
      title: item.nombre,
      description: `Cantidad: ${item.cantidad}`,
      quantity: item.cantidad,
      unit_price: Number(item.precio),
      currency_id: "ARS",
    }));

    // Agregar envío como item
    items.push({
      title: "Envío",
      description: "Costo de envío",
      quantity: 1,
      unit_price: Number(body.envio),
      currency_id: "ARS",
    });

    // Preparar información del pagador
    const nombreParts = body.cliente.nombre.split(" ");
    const nombre = nombreParts[0] || "Cliente";
    const apellido = nombreParts.slice(1).join(" ") || "";

    const payload = {
      items,
      payer: {
        name: nombre,
        surname: apellido,
        email: body.cliente.email,
        phone: {
          area_code: "54",
          number: body.cliente.telefono.replace(/[^0-9]/g, ""),
        },
        address: {
          street_name: body.cliente.direccion,
          street_number: 0,
          zip_code: body.cliente["codigo-postal"],
        },
      },
      back_urls: {
        success: `${req.headers.get("origin")}/success.html`,
        failure: `${req.headers.get("origin")}/failure.html`,
        pending: `${req.headers.get("origin")}/pending.html`,
      },
      auto_return: "approved",
      external_reference: `ORDEN-${Date.now()}-${body.cliente.documento}`,
      notification_url: "https://acapurizimtptybtjcbe.supabase.co/functions/v1/webhook-mercadopago",
    };

    console.log("Enviando a Mercado Pago:", JSON.stringify(payload));

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error de Mercado Pago:", response.status, errorData);
      throw new Error(`Error de Mercado Pago: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        preferenceId: data.id,
        redirectUrl: data.init_point,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Error en mercadopago-payment:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Error desconocido",
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
