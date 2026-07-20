import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      success: true,
    });
  }

  try {
    const order = req.body;

    console.log("========== ORDER UPDATED ==========");

    const phone =
      order.phone ||
      order.customer?.phone ||
      order.shipping_address?.phone ||
      order.billing_address?.phone;

    if (!phone) {
      console.log("No phone found.");

      return res.status(200).json({
        success: true,
      });
    }

    const target = phone.replace(/\D/g, "");

    console.log("Target:", target);

    const tags = (order.tags || "")
      .split(",")
      .map(tag => tag.trim().toLowerCase());

    console.log("Tags:", tags);

    let codConfirmationStatus = "";

    if (tags.includes("confirmed by wati")) {
      codConfirmationStatus = "confirmed";
    } else if (
      tags.includes("cancel by wati") ||
      tags.includes("cancelled by wati") ||
      tags.includes("canceled by wati")
    ) {
      codConfirmationStatus = "cancelled";
    } else if (tags.includes("cod pending")) {
      codConfirmationStatus = "pending";
    }

    console.log("COD Status:", codConfirmationStatus);

    if (!codConfirmationStatus) {
      console.log("No COD status found. Skipping WATI update.");

      return res.status(200).json({
        success: true,
      });
    }

    const response = await axios.post(
      `${process.env.WATI_API_URL}/api/v1/updateContactAttributes/${target}`,
      {
        customParams: [
          {
            name: "cod_confirmation_status",
            value: codConfirmationStatus,
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
