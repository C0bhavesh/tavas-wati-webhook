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

    // ============================
    // Get Customer Phone
    // ============================

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

    // Remove + and spaces
    const target = phone.replace(/\D/g, "");

    console.log("Target:", target);

    // ============================
    // Payment Type
    // ============================

    const gateways = order.payment_gateway_names || [];

    const paymentType = gateways.some((gateway) =>
      gateway.toLowerCase().includes("cash")
    )
      ? "cod"
      : "prepaid";

    const paymentGateway = gateways.join(", ");

    console.log("Payment Type:", paymentType);

    // ============================
    // Order Status
    // ============================

    const financialStatus = order.financial_status || "";

    const orderEnvironment = order.test ? "test" : "live";

    const cancelStatus = order.cancelled_at
      ? "cancelled"
      : "active";

    // ============================
    // Product Details
    // ============================

    const lineItems = order.line_items || [];

    const productNames = lineItems
      .map((item) => item.name)
      .join(", ");

    const productSkus = lineItems
      .map((item) => item.sku)
      .join(", ");

    const productQuantity = lineItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // ============================
    // Build WATI Attributes
    // ============================

    const customParams = [];

    function addParam(name, value) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        customParams.push({
          name,
          value: String(value),
        });
      }
    }

    // Customer
    addParam(
      "customer_first_name",
      order.customer?.first_name ||
        order.shipping_address?.first_name
    );

    addParam(
      "customer_last_name",
      order.customer?.last_name ||
        order.shipping_address?.last_name
    );

    addParam("customer_phone", phone);

    addParam("email", order.email);

    // Order
    addParam("order_id", order.id);

    addParam("order_number", order.order_number);

    addParam("order_date", order.created_at);

    addParam("total_price", order.total_price);

    addParam("order_type", paymentType);

    addParam("payment_type", paymentType);

    addParam("payment_gateway", paymentGateway);

    addParam("financial_status", financialStatus);

    addParam("order_environment", orderEnvironment);

    // Shipping
    addParam(
      "shipping_city",
      order.shipping_address?.city
    );

    addParam(
      "shipping_state",
      order.shipping_address?.province
    );

    addParam(
      "shipping_country",
      order.shipping_address?.country
    );

    addParam(
      "shipping_pincode",
      order.shipping_address?.zip
    );

    // Products
    addParam("product_names", productNames);

    addParam("product_skus", productSkus);

    addParam("product_quantity", productQuantity);

    // Cancellation
    addParam("cancel_status", cancelStatus);

    addParam(
      "cancel_reason",
      order.cancel_reason
    );

    addParam(
      "cancelled_at",
      order.cancelled_at
    );

    console.log("Updating WATI...");
    console.log(customParams);

    // ============================
    // Update WATI Contact
    // ============================

    const response = await axios.post(
      `${process.env.WATI_API_URL}/api/v1/updateContactAttributes/${target}`,
      {
        customParams,
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

    console.error("WATI Error");

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
