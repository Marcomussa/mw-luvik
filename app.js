require('dotenv').config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const auth = require('./middleware/auth')
const PORT = process.env.PORT
const crypto = require('crypto')
const productRoutes = require('./routes/products')
const userRoutes = require("./routes/customers")
const orderRoutes = require('./routes/orders')
const axios = require('axios')
const SHOPIFY_SECRET = process.env.WEBHOOK_SECRET

//! Webhook Validation. SI se modulariza no funciona. NI IDEA POR QUE
function validateSignature(req, res, next) {
    const receivedSignature = req.headers['x-shopify-hmac-sha256'];
    if (!receivedSignature) {
        return res.status(400).send('No se encontró la firma en los encabezados');
    }
  
    try {
        const rawBody = req.body;
        const generatedSignature = crypto
            .createHmac('sha256', SHOPIFY_SECRET)
            .update(rawBody)
            .digest('base64');
  
        console.log('Firma generada:', generatedSignature);
        console.log('Firma recibida:', receivedSignature);
  
        const bufferReceivedSignature = Buffer.from(receivedSignature, 'base64');
        const bufferGeneratedSignature = Buffer.from(generatedSignature, 'base64');
  
        if (crypto.timingSafeEqual(bufferReceivedSignature, bufferGeneratedSignature)) {
            console.log('Firma válida');
            next(); 
        } else {
            console.log('Firma inválida');
            res.status(401).send('Firma no válida');
        }
    } catch (error) {
        console.error('Error al validar la firma:', error);
        res.status(500).send('Error interno del servidor');
    }
}
app.use('/products', bodyParser.json({limit: '50mb', type: 'application/json'}), auth, productRoutes)

app.use("/customers", bodyParser.json({limit: '50mb', type: 'application/json'}), auth, userRoutes)

app.use("/customer/new", express.raw({ type: 'application/json' }), validateSignature, async (req, res) => {
    try {
        const data = JSON.parse(req.body);
        delete data.tax_exemptions
        delete data.email_marketing_consent
        delete data.sms_marketing_consent
        delete data.multipass_identifier

        const note = data.note
        const lines = note.split('\n');
        const extractedData = {};

        lines.forEach(line => {
            const trimmedLine = line.trim(); 
            if (trimmedLine && trimmedLine.includes(':')) { 
                const [key, value] = trimmedLine.split(/:(.+)/); 
                extractedData[key.trim()] = value.trim(); 
            }
        });

        data.note = extractedData

        console.log('Webhook recibido:', data);

        await axios.post("http://informes.luvik.com.ar/shopify.php", data)

        res.status(200).json({ message: 'Webhook procesado correctamente' });

    } catch (error) {
        console.error('Error procesando el webhook:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

app.use("/orders", express.raw({ type: 'application/json' }), validateSignature, orderRoutes)

//* SERVER *//
app.listen(PORT, () => {
    let data = {
        id: 6908572500054,
        admin_graphql_api_id: 'gid://shopify/Order/6908572500054',
        app_id: 580111,
        browser_ip: '181.164.116.113',
        buyer_accepts_marketing: true,
        cancel_reason: null,
        cancelled_at: null,
        cart_token: 'Z2NwLXVzLWVhc3QxOjAxSjRDOEVCOVc3OEdTUzdOQVhTNkFNWTdZ',
        checkout_id: 28104848212054,
        checkout_token: '20d7dfb430936d94c160a5807a66189b',
        client_details: {
          accept_language: 'es-AR',
          browser_height: null,
          browser_ip: '181.164.116.113',
          browser_width: null,
          session_hash: null,
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        },
        closed_at: null,
        confirmation_number: 'H8XDI9HYN',
        confirmed: true,
        contact_email: 'marco@marco.com',
        created_at: '2024-09-02T10:48:04-03:00',
        currency: 'ARS',
        current_subtotal_price: '433630.00',
        current_subtotal_price_set: {
          shop_money: { amount: '433630.00', currency_code: 'ARS' },
          presentment_money: { amount: '433630.00', currency_code: 'ARS' }
        },
        current_total_additional_fees_set: null,
        current_total_discounts: '0.00',
        current_total_discounts_set: {
          shop_money: { amount: '0.00', currency_code: 'ARS' },
          presentment_money: { amount: '0.00', currency_code: 'ARS' }
        },
        current_total_duties_set: null,
        current_total_price: '433630.00',
        current_total_price_set: {
          shop_money: { amount: '433630.00', currency_code: 'ARS' },
          presentment_money: { amount: '433630.00', currency_code: 'ARS' }
        },
        current_total_tax: '0.00',
        current_total_tax_set: {
          shop_money: { amount: '0.00', currency_code: 'ARS' },
          presentment_money: { amount: '0.00', currency_code: 'ARS' }
        },
        customer_locale: 'es-AR',
        device_id: null,
        discount_codes: [],
        email: 'marco@marco.com',
        estimated_taxes: false,
        financial_status: 'pending',
        fulfillment_status: null,
        landing_site: '/account/login',
        landing_site_ref: null,
        location_id: null,
        merchant_business_entity_id: 'MTU4NjAxMTc3MTc0',
        merchant_of_record_app_id: null,
        name: '#1037',
        note: null,
        note_attributes: [],
        number: 37,
        order_number: 1037,
        order_status_url: 'https://luviksa.myshopify.com/58601177174/orders/1393d5c48e9cc606604d6293741dfe27/authenticate?key=7863dce2ab6e86db626f6f803448bc58',
        original_total_additional_fees_set: null,
        original_total_duties_set: null,
        payment_gateway_names: [ 'Cash on Delivery (COD)' ],
        phone: null,
        po_number: null,
        presentment_currency: 'ARS',
        processed_at: '2024-09-02T10:48:02-03:00',
        reference: '3a628780773adb10d4d9be41966ace26',
        referring_site: '',
        source_identifier: '3a628780773adb10d4d9be41966ace26',
        source_name: 'web',
        source_url: null,
        subtotal_price: '433630.00',
        subtotal_price_set: {
          shop_money: { amount: '433630.00', currency_code: 'ARS' },
          presentment_money: { amount: '433630.00', currency_code: 'ARS' }
        },
        tags: '',
        tax_exempt: false,
        tax_lines: [],
        taxes_included: false,
        test: false,
        token: '1393d5c48e9cc606604d6293741dfe27',
        total_discounts: '0.00',
        total_discounts_set: {
          shop_money: { amount: '0.00', currency_code: 'ARS' },
          presentment_money: { amount: '0.00', currency_code: 'ARS' }
        },
        total_line_items_price: '433630.00',
        total_line_items_price_set: {
          shop_money: { amount: '433630.00', currency_code: 'ARS' },
          presentment_money: { amount: '433630.00', currency_code: 'ARS' }
        },
        total_outstanding: '433630.00',
        total_price: '433630.00',
        total_price_set: {
          shop_money: { amount: '433630.00', currency_code: 'ARS' },
          presentment_money: { amount: '433630.00', currency_code: 'ARS' }
        },
        total_shipping_price_set: {
          shop_money: { amount: '0.00', currency_code: 'ARS' },
          presentment_money: { amount: '0.00', currency_code: 'ARS' }
        },
        total_tax: '0.00',
        total_tax_set: {
          shop_money: { amount: '0.00', currency_code: 'ARS' },
          presentment_money: { amount: '0.00', currency_code: 'ARS' }
        },
        total_tip_received: '0.00',
        total_weight: 0,
        updated_at: '2024-09-02T10:48:05-03:00',
        user_id: null,
        billing_address: {
          first_name: 'Marco',
          address1: 'Tronador 3430',
          phone: '1166671955',
          city: 'caba',
          zip: '1430',
          province: 'Ciudad Autónoma de Buenos Aires',
          country: 'Argentina',
          last_name: 'Mussa',
          address2: 'departamento',
          company: 'Luvik',
          latitude: -34.5592744,
          longitude: -58.4824481,
          name: 'Marco Mussa',
          country_code: 'AR',
          province_code: 'C'
        },
        customer: {
          id: 7246959738966,
          email: 'marco@marco.com',
          created_at: '2024-09-02T09:49:17-03:00',
          updated_at: '2024-09-02T10:48:04-03:00',
          first_name: 'marco',
          last_name: 'marco',
          state: 'enabled',
          note: '\n' +
            '===start custom fields by bss-b2b-rf===\n' +
            '---2024/09/02---\n' +
            'CUIT: 0  \n' +
            'Condición Frente al IVA: monotributo  \n' +
            'Condición de Facturación: factura-a  \n' +
            'Rubro: otro  \n' +
            'Telefono: 0  \n' +
            'Whatsapp: 1111111  \n' +
            'Provincia: aaaaa  \n' +
            'Acepto recibir información sobre ofertas y promociones: option-1  \n' +
            'Constancia AFIP: public/static/base/images/registration_form_upload/19110/Observaciones Proceso Pedidos plataforma Shopify clientes B2B (1).pdf  \n' +
            'Ticket de caja: public/static/base/images/registration_form_upload/19110/Proceso de compra en plataforma Shopify B2B 05.04.2024 (1).pdf  \n' +
            '===end custom fields by bss-b2b-rf===',
          verified_email: true,
          multipass_identifier: null,
          tax_exempt: false,
          phone: null,
          email_marketing_consent: {
            state: 'subscribed',
            opt_in_level: 'single_opt_in',
            consent_updated_at: '2024-09-02T09:49:17-03:00'
          },
          sms_marketing_consent: null,
          tags: 'empresa',
          currency: 'ARS',
          tax_exemptions: [],
          admin_graphql_api_id: 'gid://shopify/Customer/7246959738966',
          default_address: {
            id: 9025984954454,
            customer_id: 7246959738966,
            first_name: 'Marco',
            last_name: 'Mussa',
            company: 'Luvik',
            address1: 'Tronador 3430',
            address2: 'departamento',
            city: 'caba',
            province: 'Ciudad Autónoma de Buenos Aires',
            country: 'Argentina',
            zip: '1430',
            phone: '1166671955',
            name: 'Marco Mussa',
            province_code: 'C',
            country_code: 'AR',
            country_name: 'Argentina',
            default: true
          }
        },
        discount_applications: [],
        fulfillments: [],
        line_items: [
          {
            id: 15379135463510,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135463510',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'PICADILLO SWIFT 90 Grs',
            price: '11496.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381130051670,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '20015',
            taxable: true,
            title: 'PICADILLO SWIFT 90 Grs',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41683012124758,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'SWIFT',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          },
          {
            id: 15379135496278,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135496278',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'ACEITE NATURA GIRASOL 1.5 Lt.',
            price: '27588.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381114978390,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '220201',
            taxable: true,
            title: 'ACEITE NATURA GIRASOL 1.5 Lt.',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41682978111574,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'NATURA',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          },
          {
            id: 15379135529046,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135529046',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'POLENTA DEL CAMPO 500 Grs',
            price: '9980.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381164294230,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '40559',
            taxable: true,
            title: 'POLENTA DEL CAMPO 500 Grs',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41683100565590,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'DEL CAMPO',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          },
          {
            id: 15379135561814,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135561814',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'ACEITE LIRA MEZCLA 1.5 Lt.',
            price: '47388.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381115699286,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '120061',
            taxable: true,
            title: 'ACEITE LIRA MEZCLA 1.5 Lt.',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41682979749974,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'LIRA',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          },
          {
            id: 15379135594582,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135594582',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'KETCHUP HELLMANS D/P 250 Grs',
            price: '27576.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381117010006,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '140234',
            taxable: true,
            title: 'KETCHUP HELLMANS D/P 250 Grs',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41682981814358,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'HELLMANS',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          },
          {
            id: 15379135627350,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135627350',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'ACEITE OLIVA LIRA Lata 1 Lt.',
            price: '202788.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381115928662,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '120059',
            taxable: true,
            title: 'ACEITE OLIVA LIRA Lata 1 Lt.',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41682980012118,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'LIRA',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          },
          {
            id: 15379135660118,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135660118',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'ACEITE AEROSOL NATURA 120 CC.',
            price: '19788.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381114454102,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '220211',
            taxable: true,
            title: 'ACEITE AEROSOL NATURA 120 CC.',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41682977554518,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'NATURA',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          },
          {
            id: 15379135692886,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135692886',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'BARBACOA HELLMANS D/P 250 Grs',
            price: '13188.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381116911702,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '140195',
            taxable: true,
            title: 'BARBACOA HELLMANS D/P 250 Grs',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41682981748822,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'HELLMANS',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          },
          {
            id: 15379135725654,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135725654',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'ALMIDON MAIZ MAIZENA 250 Grs',
            price: '47450.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381163966550,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '140010',
            taxable: true,
            title: 'ALMIDON MAIZ MAIZENA 250 Grs',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41683100205142,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'MAIZENA',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          },
          {
            id: 15379135758422,
            admin_graphql_api_id: 'gid://shopify/LineItem/15379135758422',
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: 'manual',
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: 'ACEITE CAÑUELAS GIRASOL 1.5 Lt.',
            price: '26388.00',
            price_set: [Object],
            product_exists: true,
            product_id: 7381114650710,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sku: '270038',
            taxable: true,
            title: 'ACEITE CAÑUELAS GIRASOL 1.5 Lt.',
            total_discount: '0.00',
            total_discount_set: [Object],
            variant_id: 41682977751126,
            variant_inventory_management: 'shopify',
            variant_title: null,
            vendor: 'CAÑUELAS',
            tax_lines: [],
            duties: [],
            discount_allocations: []
          }
        ],
        payment_terms: null,
        refunds: [],
        shipping_address: {
          first_name: 'Marco',
          address1: 'Tronador 3430',
          phone: '1166671955',
          city: 'caba',
          zip: '1430',
          province: 'Ciudad Autónoma de Buenos Aires',
          country: 'Argentina',
          last_name: 'Mussa',
          address2: 'departamento',
          company: 'Luvik',
          latitude: -34.5592744,
          longitude: -58.4824481,
          name: 'Marco Mussa',
          country_code: 'AR',
          province_code: 'C'
        },
        shipping_lines: [
          {
            id: 4885079916630,
            carrier_identifier: '650f1a14fa979ec5c74d063e968411d4',
            code: 'Standard',
            discounted_price: '0.00',
            discounted_price_set: [Object],
            is_removed: false,
            phone: null,
            price: '0.00',
            price_set: [Object],
            requested_fulfillment_service_id: null,
            source: 'shopify',
            title: 'Standard',
            tax_lines: [],
            discount_allocations: []
          }
        ]
    }

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

    console.log(data)

    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})