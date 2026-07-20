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

    // Get phone number
    const phone =
      order.phone ||
      order.customer?.phone ||
      order.shipping_address?.phone ||
      order.billing_address?.phone;

    if (!phone) {
      console.log("No phone number found.");
      return res.status(200).json({
        success: true,
        message: "No phone number",
      });
    }

    // Convert +918238232528 → 918238232528
    const target = phone.replace(/\D/g, "");

    // Detect payment type
    const gateways = order.payment_gateway_names || [];

    const paymentType = gateways.some((gateway) =>
      gateway.toLowerCase().includes("cash")
    )
      ? "cod"
      : "prepaid";

    console.log("Target:", target);
    console.log("Payment Type:", paymentType);

    // Update WATI
    const response = await axios.post(
      `${process.env.WATI_API_URL}/api/v1/updateContactAttributes/${target}`,
      {
        customParams: [
          {
            name: "order_type",
            value: paymentType,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WATI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WATI Success:");
    console.log(response.data);

    return res.status(200).json({
      success: true,
    });

  } catch (error) {

    console.error("WATI Error:");

    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    return res.status(500).json({
      success: false,
    });
  }
}
