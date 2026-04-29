import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace("/functions/v1/orders", "");

    // GET /orders - List user orders
    if (req.method === "GET" && (path === "" || path === "/")) {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /orders/:id - Get single order
    if (req.method === "GET" && path.startsWith("/") && path.length > 1) {
      const orderId = path.slice(1);
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /orders - Create order
    if (req.method === "POST" && (path === "" || path === "/")) {
      const body = await req.json();
      const { items, shipping_address, payment_method } = body;

      // Get cart items with product details
      const { data: cartItems, error: cartError } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", user.id);

      if (cartError) throw cartError;
      if (!cartItems || cartItems.length === 0) {
        return new Response(JSON.stringify({ error: "Cart is empty" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const totalAmount = cartItems.reduce(
        (sum: number, item: any) => sum + (item.product?.price ?? 0) * item.quantity,
        0
      );
      const shipping = totalAmount >= 500 ? 0 : 49;
      const finalAmount = totalAmount + shipping;

      const orderNumber = `SK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: finalAmount,
          shipping_address: shipping_address,
          payment_method: payment_method || "cod",
          payment_status: payment_method === "cod" ? "pending" : "paid",
        })
        .select()
        .maybeSingle();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name ?? "",
        product_image: item.product?.image_url ?? "",
        price: item.product?.price ?? 0,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Clear cart
      await supabase.from("cart_items").delete().eq("user_id", user.id);

      return new Response(JSON.stringify({ order, order_number: orderNumber }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
