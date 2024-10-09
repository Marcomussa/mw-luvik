require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/new", async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    delete data.app_id;
    delete data.cart_token;
    delete data.checkout_id;
    delete data.checkout_token;
    delete data.client_details;
    delete data.closed_at;
    delete data.current_subtotal_price_set;
    delete data.current_total_additional_fees_set;
    delete data.current_total_discounts;
    delete data.current_total_discounts_set;
    delete data.current_total_duties_set;
    delete data.current_subtotal_price;
    delete data.current_total_price_set;
    delete data.current_total_tax;
    delete data.current_total_tax_set;
    delete data.device_id;
    delete data.discount_codes;
    delete data.fulfillment_status;
    delete data.landing_site;
    delete data.landing_site_ref;
    delete data.location_id;
    delete data.merchant_business_entity_id;
    delete data.merchant_of_record_app_id;
    delete data.note_attributes;
    delete data.number;
    delete data.name;
    delete data.original_total_additional_fees_set;
    delete data.original_total_duties_set;
    delete data.phone;
    delete data.po_number;
    delete data.referring_site;
    delete data.source_identifier;
    delete data.source_name;
    delete data.source_url;
    delete data.subtotal_price;
    delete data.subtotal_price_set;
    delete data.tax_exempt;
    delete data.tax_lines;
    delete data.taxes_included;
    delete data.test;
    delete data.token;
    delete data.total_discounts;
    delete data.total_discounts_set;
    delete data.total_line_items_price;
    delete data.total_line_items_price_set;
    delete data.total_outstanding;
    delete data.total_price_set;
    delete data.total_shipping_price_set;
    delete data.total_tax;
    delete data.total_tax_set;
    delete data.total_tip_received;
    delete data.user_id;
    delete data.fulfillments;
    delete data.discount_applications;
    delete data.payment_terms;
    delete data.refunds;

    delete data.customer.multipass_identifier
    delete data.customer.tax_exempt
    delete data.customer.sms_marketing_consent
    delete data.customer.tax_exemptions
    delete data.customer.email_marketing_consent
    delete data.customer.phone

    data.line_items.forEach((item) => {
      delete item.attributed_staffs
      delete item.current_quantity
      delete item.fulfillable_quantity
      delete item.fulfillment_service
      delete item.fulfillment_status
      delete item.gift_card
      delete item.grams
      delete item.price_set
      delete item.properties
      delete item.total_discount
      delete item.total_discount_set
      delete item.variant_id
      delete item.variant_inventory_management
      delete item.variant_title
      delete item.tax_lines
      delete item.duties
      delete item.discount_allocations
    });

    delete data.shipping_lines[0].discounted_price
    delete data.shipping_lines[0].discounted_price_set
    delete data.shipping_lines[0].price
    delete data.shipping_lines[0].price_set
    delete data.shipping_lines[0].tax_lines
    delete data.shipping_lines[0].discount_allocations
    delete data.shipping_lines[0].requested_fulfillment_service_id
    delete data.shipping_lines[0].phone
    delete data.shipping_lines[0].is_removed
    delete data.shipping_lines[0].current_discounted_price_set

    const lines = data.customer.note.split("\n");
    const extractedData = {};

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && trimmedLine.includes(":")) {
        const [key, value] = trimmedLine.split(/:(.+)/);
        extractedData[key.trim()] = value.trim();
      }
    });

    data.customer.note = extractedData;

    await axios.post("http://informes.luvik.com.ar/shopify_pedido.php", data);

    //! UPDATE DE STOCK

    console.log("Webhook recibido:", data);
    res.status(200).json({ message: "Webhook procesado correctamente" });
  } catch (error) {
    console.error("Error procesando el webhook:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
