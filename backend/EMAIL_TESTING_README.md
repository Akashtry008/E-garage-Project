# E-Garage Email Testing

This document explains how to use the E-Garage email testing tools, with a focus on testing emails using the Yopmail configuration.

## Quick Start

To quickly test email functionality:

1. Open a command prompt in the `backend` directory
2. Run the email testing batch file:
   ```
   yopmail_test.bat
   ```
3. Select a test option from the menu
4. Enter the recipient email address (preferably a Yopmail address, e.g., `test@yopmail.com`)
5. Check the generated email HTML file in the `emails` directory

## Available Testing Tools

### 1. yopmail_test.bat (Recommended)

A comprehensive menu-driven tool that offers:

- Basic email tests
- Password reset email tests
- Account verification email tests
- Booking confirmation email tests
- Email configuration viewing
- Previous test email viewing

### 2. email_test.bat

The original email testing utility with a similar interface but different test options.

### 3. test_yopmail.py

The core Python script for testing basic emails with Yopmail:

```
python test_yopmail.py recipient@example.com
```

### 4. send_test_email.py

An advanced Python script for sending custom emails:

```
python send_test_email.py recipient@example.com -s "Custom Subject" -c "<h1>HTML Content</h1>"
```

## Yopmail Testing

[Yopmail](https://yopmail.com/) is a service providing disposable email addresses. It's useful for testing because:

1. No registration is required
2. You can instantly view emails sent to any @yopmail.com address
3. It's temporary and disposable

### How to View Emails

1. After sending a test email to `example@yopmail.com`
2. Go to [https://yopmail.com/](https://yopmail.com/)
3. Enter `example` in the inbox field
4. Click "Check Inbox" to view messages

Note: The actual emails will be saved as HTML files in the `emails` directory of your project, regardless of whether they're successfully sent or not.

## Email Configuration

Email settings are configured in the `.env` file:

```
EMAIL_HOST = smtp.yopmail.com
EMAIL_PORT = 587
EMAIL_HOST_USER = e-garage@yopmail.com
EMAIL_HOST_PASSWORD = 
EMAIL_USE_TLS = True
LOG_EMAILS = True
SEND_REAL_EMAILS = False
```

Notes:
- Yopmail doesn't have an SMTP server, so actual sending will fail (this is expected)
- With `SEND_REAL_EMAILS = False`, emails are only saved locally, not actually sent
- All emails are saved to the `emails` directory regardless of sending success

## Troubleshooting

If you encounter issues:

1. **Script not found errors**:
   - Make sure you're running the batch file from the `backend` directory
   - Check that all required Python scripts exist

2. **Python errors**:
   - Ensure Python is installed and in your PATH
   - Check that required packages are installed (dotenv, etc.)

3. **No emails appear in Yopmail inbox**:
   - This is normal - Yopmail doesn't have an SMTP server
   - Check the `emails` directory for the saved HTML files

4. **Configuration issues**:
   - Verify your `.env` file has the correct email configuration
   - Use the "View Email Configuration" option to check current settings

## For Developers

When implementing new email features:

1. Use the `yopmail_test.bat` tool to test your email templates
2. Check the saved HTML files in the `emails` directory for proper formatting
3. Use the `send_test_email.py` script for custom testing
4. Remember to set `SEND_REAL_EMAILS = True` in production only 