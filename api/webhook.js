import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      success: true,
      message: "TAVAS WATI Webhook is working 🚀",
    });
  }

  try {
    const order = req.body;

    console.log("========== NEW SHOPIFY ORDER ==========");
    console.log(order);

    // Get customer phone
    const phone =
      order.phone ||
      order.customer?.phone ||
      order.shipping_address?.phone ||
      order.billing_address?.phone;

    console.log("Phone:", phone);

    // Detect payment type
    const gateways = order.payment_gateway_names || [];

    const paymentType = gateways.some((gateway) =>
      gateway.toLowerCase().includes("cash")
    )
      ? "cod"
      : "prepaid";

    console.log("Payment Type:", paymentType);

    console.log("Gateway:", gateways.join(", "));

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
