export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      success: true,
      message: "TAVAS WATI Webhook is working 🚀"
    });
  }

  const order = req.body;

  console.log("New Shopify Order Received");
  console.log(order);

  return res.status(200).json({
    success: true,
    message: "Webhook received successfully"
  });
}
