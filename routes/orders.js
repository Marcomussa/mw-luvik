require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/new", async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    const {
      app_id,
      cart_token,
      checkout_id,
      checkout_token,
      client_details,
      closed_at,
      current_subtotal_price_set,
      current_total_additional_fees_set,
      current_total_discounts,
      current_total_discounts_set,
      current_total_duties_set,
      current_subtotal_price,
      current_total_price_set,
      current_total_tax,
      current_total_tax_set,
      device_id,
      discount_codes,
      fulfillment_status,
      landing_site,
      landing_site_ref,
      location_id,
      merchant_business_entity_id,
      merchant_of_record_app_id,
      note_attributes,
      number,
      name,
      original_total_additional_fees_set,
      original_total_duties_set,
      phone,
      po_number,
      referring_site,
      source_identifier,
      source_name,
      source_url,
      subtotal_price,
      subtotal_price_set,
      tax_exempt,
      tax_lines,
      taxes_included,
      test,
      token,
      total_discounts,
      total_discounts_set,
      total_line_items_price,
      total_line_items_price_set,
      total_outstanding,
      total_price_set,
      total_shipping_price_set,
      total_tax,
      total_tax_set,
      total_tip_received,
      user_id,
      fulfillments,
      discount_applications,
      payment_terms,
      refunds,
    } = data;

    delete app_id;
    delete cart_token;
    delete checkout_id;
    delete checkout_token;
    delete client_details;
    delete closed_at;
    delete current_subtotal_price_set;
    delete current_total_additional_fees_set;
    delete current_total_discounts;
    delete current_total_discounts_set;
    delete current_total_duties_set;
    delete current_subtotal_price;
    delete current_total_price_set;
    delete current_total_tax;
    delete current_total_tax_set;
    delete device_id;
    delete discount_codes;
    delete fulfillment_status;
    delete landing_site;
    delete landing_site_ref;
    delete location_id;
    delete merchant_business_entity_id;
    delete merchant_of_record_app_id;
    delete note_attributes;
    delete number;
    delete name;
    delete original_total_additional_fees_set;
    delete original_total_duties_set;
    delete phone;
    delete po_number;
    delete referring_site;
    delete source_identifier;
    delete source_name;
    delete source_url;
    delete subtotal_price;
    delete subtotal_price_set;
    delete tax_exempt;
    delete tax_lines;
    delete taxes_included;
    delete test;
    delete token;
    delete total_discounts;
    delete total_discounts_set;
    delete total_line_items_price;
    delete total_line_items_price_set;
    delete total_outstanding;
    delete total_price_set;
    delete total_shipping_price_set;
    delete total_tax;
    delete total_tax_set;
    delete total_tip_received;
    delete user_id;
    delete fulfillments;
    delete discount_applications;
    delete payment_terms;
    delete refunds;

    const {
      note,
      multipass_identifier,
      ax_exempt,
      sms_marketing_consent,
      tax_exemptions,
    } = data.customer;

    delete multipass_identifier
    delete ax_exempt
    delete sms_marketing_consent
    delete tax_exemptions

    data.line_items.forEach((item) => {
      const {
        attributed_staffs,
        current_quantity,
        fulfillable_quantity,
        fulfillment_service,
        fulfillment_status,
        gift_card,
        grams,
        price_set,
        properties,
        total_discount,
        total_discount_set,
        variant_id,
        variant_inventory_management,
        variant_title,
        tax_lines,
        duties,
        discount_allocations,
      } = item;

      delete attributed_staffs
      delete current_quantity
      delete fulfillable_quantity
      delete fulfillment_service
      delete fulfillment_status
      delete gift_card
      delete grams
      delete price_set
      delete properties
      delete total_discount
      delete total_discount_set
      delete variant_id
      delete variant_inventory_management
      delete variant_title
      delete tax_lines
      delete duties
      delete discount_allocations
    });

    const lines = note.split("\n");
    const extractedData = {};

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && trimmedLine.includes(":")) {
        const [key, value] = trimmedLine.split(/:(.+)/);
        extractedData[key.trim()] = value.trim();
      }
    });

    note = extractedData;

    console.log("Webhook recibido:", data);

    await axios.post("http://informes.luvik.com.ar/shopify.php", data);

    res.status(200).json({ message: "Webhook procesado correctamente" });
  } catch (error) {
    console.error("Error procesando el webhook:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
