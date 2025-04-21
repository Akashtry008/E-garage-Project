# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# E-Garage Service Application

This application provides automotive service booking and management.

## Setting Up EmailJS for Invoice Emails

To enable the PDF invoice attachment feature, follow these steps:

### 1. EmailJS Setup

1. Create an account at [EmailJS](https://www.emailjs.com/) if you haven't already
2. Create a service connecting to your email provider (Gmail, Outlook, etc.)
3. Create a new email template with the following settings:

### 2. Configure Email Template

1. In the EmailJS dashboard, go to "Email Templates" and create a new template
2. Give it a name (e.g., "Payment Confirmation with Invoice")
3. Set up the template content:

```html
<h2>Payment Confirmation - E-Garage Service</h2>

<p>Dear {{name}},</p>

<p>Thank you for your payment. Your service booking has been confirmed.</p>

<h3>Payment Details:</h3>
<ul>
  <li><strong>Service:</strong> {{service}}</li>
  <li><strong>Amount:</strong> {{amount}}</li>
  <li><strong>Payment ID:</strong> {{payment_id}}</li>
</ul>

<p>Your invoice is attached to this email as a PDF document.</p>

<p>If you have any questions, please don't hesitate to contact us.</p>

<p>Best regards,<br>
E-Garage Service Team</p>
```

4. In the "Files" panel (scroll down in the template editor):
   - Click on "Add attachment"
   - Set Name: `invoice.pdf`
   - For Content, select "Use a template variable"
   - Enter variable name: `invoice_pdf`
   - Set Type: `base64`
   - Click "Save"

5. Save the template and note its ID (you'll need it for step 3)

### 3. Update the Application Code

Make sure to update the following in your code:

1. In `index.html`, update the EmailJS user ID:
```javascript
emailjs.init("YOUR_USER_ID_HERE");
```

2. In `src/Components/user/Payment.jsx`, update these values:
```javascript
window.emailjs.send(
  "YOUR_SERVICE_ID",     // Replace with your EmailJS service ID
  "YOUR_TEMPLATE_ID",    // Replace with your EmailJS template ID
  emailParams
)
```

### 4. Required Libraries

This application uses the following libraries loaded via CDN:
- EmailJS: For sending emails with PDF attachments
- jsPDF: For generating PDF invoices
- Razorpay: For processing payments

The CDN scripts are already included in the index.html file.

## Running the Application

### Frontend

```
npm start
```

### Backend

```
cd backend
python -m uvicorn main:app --reload --port 8000
```
