const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (toEmail, toName, subject, htmlContent) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL || 'orders@nene.com',
      name: process.env.BREVO_SENDER_NAME || 'Nene Yogurt'
    };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error to prevent blocking the main flow, just log it
    return null;
  }
};

const sendOrderConfirmation = async (order) => {
  const subject = `Order Confirmation - ${order.order_number}`;

  const itemsHtml = order.items.map(item => `
    <div style="display: flex; gap: 16px; margin-bottom: 16px;">
      <div style="flex-grow: 1;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h4 style="margin: 0; font-size: 14px; font-weight: bold; text-transform: uppercase; color: #1c1917;">${item.product_name}</h4>
          <span style="font-size: 14px; font-weight: bold; color: #1c1917;">₦${parseFloat(item.subtotal).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
        </div>
        <p style="margin: 4px 0 0; font-size: 12px; color: #78716c;">Qty: ${item.quantity}</p>
        <p style="margin: 0; font-size: 12px; color: #78716c;">Price: ₦${parseFloat(item.product_price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Top Border -->
        <div style="height: 12px; background-color: #0d9488; width: 100%;"></div>

        <div style="padding: 32px;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
            <div>
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #1c1917; font-family: serif;">Nené.</h1>
              <p style="margin: 4px 0 0; font-size: 10px; color: #78716c; text-transform: uppercase;">PURE & NATURAL YOGURT</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #1c1917;">Thank you!</h2>
              <p style="margin: 4px 0 0; font-size: 12px; color: #78716c;">Your order is confirmed.</p>
            </div>
          </div>

          <!-- Order Info Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; border-bottom: 1px solid #f5f5f4; padding-bottom: 24px; font-size: 12px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-weight: bold; color: #1c1917;">Date:</p>
              <p style="margin: 4px 0 0; color: #57534e;">${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-weight: bold; color: #1c1917;">Order number:</p>
              <p style="margin: 4px 0 0; color: #57534e;">#${order.order_number}</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-weight: bold; color: #1c1917;">Payment:</p>
              <p style="margin: 4px 0 0; color: #57534e;">Paid via Paystack</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-weight: bold; color: #1c1917;">Delivery info:</p>
              <p style="margin: 4px 0 0; color: #57534e;">${order.customer_first_name} ${order.customer_last_name}</p>
              <p style="margin: 0; color: #57534e;">${order.shipping_address}</p>
              <p style="margin: 0; color: #57534e;">${order.shipping_city}, ${order.shipping_state}</p>
            </div>
          </div>

          <!-- Items List -->
          <div style="margin-bottom: 32px;">
            <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: bold; color: #1c1917; border-bottom: 1px solid #f5f5f4; padding-bottom: 8px;">Description</h3>
            ${itemsHtml}
          </div>

          <!-- Totals -->
          <div style="border-top: 1px solid #e7e5e4; padding-top: 16px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #57534e;">
              <span>Subtotal</span>
              <span>₦${parseFloat(order.subtotal).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #57534e;">
              <span>Shipping</span>
              <span>₦${parseFloat(order.shipping_fee).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
            ${order.discount_amount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #0d9488;">
              <span>Discount</span>
              <span>-₦${parseFloat(order.discount_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 16px; border-top: 2px solid #1c1917; font-size: 18px; font-weight: bold; color: #1c1917;">
              <span>Total <span style="font-size: 10px; font-weight: normal; color: #78716c;">(incl. VAT)</span></span>
              <span>₦${parseFloat(order.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <!-- Footer Message -->
          <div style="margin-top: 32px; text-align: center; font-size: 10px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 16px;">
            <p style="margin: 0 0 4px;">This email confirms payment for the products listed above.</p>
            <p style="margin: 0;">© 2025 Nené Foods. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(order.customer_email, `${order.customer_first_name} ${order.customer_last_name}`, subject, htmlContent);
};

const sendOrderShipped = async (order) => {
  const subject = `Your Order Has Shipped! 🚚 - ${order.order_number}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Top Border - Teal for shipping -->
        <div style="height: 8px; background: linear-gradient(90deg, #0d9488 0%, #14b8a6 100%); width: 100%;"></div>

        <div style="padding: 40px 32px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1c1917; font-family: Georgia, serif;">Nené.</h1>
            <p style="margin: 4px 0 0; font-size: 10px; color: #78716c; text-transform: uppercase; letter-spacing: 2px;">PURE & NATURAL YOGURT</p>
          </div>

          <!-- Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #f0fdfa; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🚚</span>
            </div>
          </div>

          <!-- Message -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 600; color: #1c1917;">Your order is on the way!</h2>
            <p style="margin: 0; font-size: 14px; color: #57534e;">Hi ${order.customer_first_name}, great news! Your order has been shipped.</p>
          </div>

          <!-- Order Details Box -->
          <div style="background-color: #fafaf9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <div>
                <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Order Number</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #1c1917;">#${order.order_number}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Status</p>
                <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #0d9488;">Shipped</p>
              </div>
            </div>
            <div style="border-top: 1px solid #e7e5e4; padding-top: 16px;">
              <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Delivery Address</p>
              <p style="margin: 4px 0 0; font-size: 14px; color: #1c1917;">${order.shipping_address}</p>
              <p style="margin: 0; font-size: 14px; color: #1c1917;">${order.shipping_city}, ${order.shipping_state}</p>
            </div>
          </div>

          <!-- Info Box -->
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #065f46;">
              <strong>📍 What's next?</strong><br>
              You'll receive a call from our delivery partner when they're on the way. Please ensure someone is available to receive the package.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 24px;">
            <p style="margin: 0 0 4px;">Questions? Reply to this email or contact us.</p>
            <p style="margin: 0;">© 2025 Nené Foods. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(order.customer_email, `${order.customer_first_name} ${order.customer_last_name}`, subject, htmlContent);
};

const sendOrderDelivered = async (order) => {
  const subject = `Order Delivered! 🎉 - ${order.order_number}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Top Border - Green for delivered -->
        <div style="height: 8px; background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%); width: 100%;"></div>

        <div style="padding: 40px 32px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1c1917; font-family: Georgia, serif;">Nené.</h1>
            <p style="margin: 4px 0 0; font-size: 10px; color: #78716c; text-transform: uppercase; letter-spacing: 2px;">PURE & NATURAL YOGURT</p>
          </div>

          <!-- Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #f0fdf4; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🎉</span>
            </div>
          </div>

          <!-- Message -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 600; color: #1c1917;">Your order has been delivered!</h2>
            <p style="margin: 0; font-size: 14px; color: #57534e;">Hi ${order.customer_first_name}, we hope you enjoy your Nené treats!</p>
          </div>

          <!-- Order Details Box -->
          <div style="background-color: #fafaf9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Order Number</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #1c1917;">#${order.order_number}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Status</p>
                <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #16a34a;">✓ Delivered</p>
              </div>
            </div>
          </div>

          <!-- Review Request -->
          <div style="background-color: #fef3c7; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #92400e;">⭐ Enjoying your order?</p>
            <p style="margin: 0; font-size: 14px; color: #a16207;">We'd love to hear from you! Leave a review and help others discover Nené.</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 24px;">
            <p style="margin: 0 0 4px;">Thank you for choosing Nené! 💚</p>
            <p style="margin: 0;">© 2025 Nené Foods. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(order.customer_email, `${order.customer_first_name} ${order.customer_last_name}`, subject, htmlContent);
};

const sendOrderCancelled = async (order) => {
  const subject = `Order Cancelled - ${order.order_number}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Cancelled</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Top Border - Red for cancelled -->
        <div style="height: 8px; background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%); width: 100%;"></div>

        <div style="padding: 40px 32px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1c1917; font-family: Georgia, serif;">Nené.</h1>
            <p style="margin: 4px 0 0; font-size: 10px; color: #78716c; text-transform: uppercase; letter-spacing: 2px;">PURE & NATURAL YOGURT</p>
          </div>

          <!-- Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #fef2f2; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">❌</span>
            </div>
          </div>

          <!-- Message -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 600; color: #1c1917;">Order Cancelled</h2>
            <p style="margin: 0; font-size: 14px; color: #57534e;">Hi ${order.customer_first_name}, your order has been cancelled.</p>
          </div>

          <!-- Order Details Box -->
          <div style="background-color: #fafaf9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Order Number</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #1c1917;">#${order.order_number}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Status</p>
                <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #dc2626;">Cancelled</p>
              </div>
            </div>
          </div>

          <!-- Refund Info -->
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #991b1b;">
              <strong>💳 Refund Information</strong><br>
              If you have already paid, a refund will be processed within 3-5 business days. The amount will be credited back to your original payment method.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 24px;">
            <p style="margin: 0 0 4px;">Questions about your cancellation? Reply to this email.</p>
            <p style="margin: 0;">© 2025 Nené Foods. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(order.customer_email, `${order.customer_first_name} ${order.customer_last_name}`, subject, htmlContent);
};

const sendOrderUpdated = async (order, changes) => {
  const subject = `Order Updated - ${order.order_number}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Updated</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Top Border - Amber for updates -->
        <div style="height: 8px; background: linear-gradient(90deg, #d97706 0%, #f59e0b 100%); width: 100%;"></div>

        <div style="padding: 40px 32px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1c1917; font-family: Georgia, serif;">Nené.</h1>
            <p style="margin: 4px 0 0; font-size: 10px; color: #78716c; text-transform: uppercase; letter-spacing: 2px;">PURE & NATURAL YOGURT</p>
          </div>

          <!-- Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #fffbeb; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">📝</span>
            </div>
          </div>

          <!-- Message -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 600; color: #1c1917;">Order Updated</h2>
            <p style="margin: 0; font-size: 14px; color: #57534e;">Hi ${order.customer_first_name}, there's an update to your order.</p>
          </div>

          <!-- Order Details Box -->
          <div style="background-color: #fafaf9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Order Number</p>
              <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #1c1917;">#${order.order_number}</p>
            </div>
            <div style="border-top: 1px solid #e7e5e4; padding-top: 16px;">
              <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Changes Made</p>
              <p style="margin: 4px 0 0; font-size: 14px; color: #1c1917;">${changes}</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 24px;">
            <p style="margin: 0 0 4px;">Questions? Reply to this email or contact us.</p>
            <p style="margin: 0;">© 2025 Nené Foods. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(order.customer_email, `${order.customer_first_name} ${order.customer_last_name}`, subject, htmlContent);
};

const sendOrderStatusUpdate = async (order, newStatus) => {
  switch (newStatus) {
    case 'shipped':
      return sendOrderShipped(order);
    case 'delivered':
      return sendOrderDelivered(order);
    case 'cancelled':
      return sendOrderCancelled(order);
    default:
      return sendOrderUpdated(order, `Status changed to ${newStatus}`);
  }
};

const send2FACode = async (email, code, name) => {
  const subject = 'Your Nené Admin Verification Code';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Top Border -->
        <div style="height: 8px; background: linear-gradient(90deg, #0d9488 0%, #14b8a6 100%); width: 100%;"></div>

        <div style="padding: 40px 32px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1c1917; font-family: Georgia, serif;">Nené.</h1>
            <p style="margin: 4px 0 0; font-size: 10px; color: #78716c; text-transform: uppercase; letter-spacing: 2px;">ADMIN PORTAL</p>
          </div>

          <!-- Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background-color: #f0fdfa; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px;">🔐</span>
            </div>
          </div>

          <!-- Message -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #1c1917;">Verification Code</h2>
            <p style="margin: 0; font-size: 14px; color: #57534e;">Hi ${name || 'Admin'}, here is your login verification code:</p>
          </div>

          <!-- Code Box -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0d9488; font-family: 'Courier New', monospace;">${code}</span>
          </div>

          <!-- Warning -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>⚠️ This code expires in 10 minutes.</strong><br>
              If you didn't request this code, please ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 11px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 24px;">
            <p style="margin: 0 0 4px;">This is an automated security email from Nené Admin.</p>
            <p style="margin: 0;">© 2025 Nené Foods. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, name || 'Admin', subject, htmlContent);
};

const sendContactNotification = async (contactMessage, adminEmail) => {
  const subject = `New Contact Message: ${contactMessage.subject}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Message</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Top Border - Blue for messages -->
        <div style="height: 8px; background: linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%); width: 100%;"></div>

        <div style="padding: 40px 32px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1c1917; font-family: Georgia, serif;">Nené.</h1>
            <p style="margin: 4px 0 0; font-size: 10px; color: #78716c; text-transform: uppercase; letter-spacing: 2px;">NEW CONTACT MESSAGE</p>
          </div>

          <!-- Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #e0f2fe; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">📬</span>
            </div>
          </div>

          <!-- Message -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #1c1917;">New message from your website</h2>
            <p style="margin: 0; font-size: 14px; color: #57534e;">Someone has sent you a message via the contact form.</p>
          </div>

          <!-- Contact Details Box -->
          <div style="background-color: #fafaf9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">From</p>
              <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #1c1917;">${contactMessage.name}</p>
            </div>
            <div style="margin-bottom: 16px; border-top: 1px solid #e7e5e4; padding-top: 16px;">
              <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Email</p>
              <p style="margin: 4px 0 0; font-size: 14px; color: #0284c7;"><a href="mailto:${contactMessage.email}" style="color: #0284c7; text-decoration: none;">${contactMessage.email}</a></p>
            </div>
            ${contactMessage.phone ? `
            <div style="margin-bottom: 16px; border-top: 1px solid #e7e5e4; padding-top: 16px;">
              <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Phone</p>
              <p style="margin: 4px 0 0; font-size: 14px; color: #1c1917;"><a href="tel:${contactMessage.phone}" style="color: #1c1917; text-decoration: none;">${contactMessage.phone}</a></p>
            </div>
            ` : ''}
            <div style="border-top: 1px solid #e7e5e4; padding-top: 16px;">
              <p style="margin: 0; font-size: 12px; color: #78716c; text-transform: uppercase;">Subject</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #1c1917;">${contactMessage.subject}</p>
            </div>
          </div>

          <!-- Message Content -->
          <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 12px; color: #78716c; text-transform: uppercase;">Message</p>
            <p style="margin: 0; font-size: 14px; color: #1c1917; white-space: pre-wrap; line-height: 1.6;">${contactMessage.message}</p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="mailto:${contactMessage.email}?subject=Re: ${encodeURIComponent(contactMessage.subject)}" style="display: inline-block; background-color: #0284c7; color: white; font-size: 14px; font-weight: bold; padding: 14px 32px; text-decoration: none; border-radius: 8px;">Reply to Message</a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 24px;">
            <p style="margin: 0 0 4px;">View all messages in your admin dashboard.</p>
            <p style="margin: 0;">© 2025 Nené Foods. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(adminEmail, 'Admin', subject, htmlContent);
};

module.exports = {
  sendOrderConfirmation,
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderCancelled,
  sendOrderUpdated,
  sendOrderStatusUpdate,
  send2FACode,
  sendContactNotification
};

