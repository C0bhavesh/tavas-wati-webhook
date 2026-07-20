export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      success: true,
    });
  }

  const order = req.body;

  console.log("========== ORDER UPDATED ==========");
  console.log("Order ID:", order.id);
  console.log("Phone:", order.phone);
  console.log("Tags:", order.tags);

  return res.status(200).json({
    success: true,
  });
}
