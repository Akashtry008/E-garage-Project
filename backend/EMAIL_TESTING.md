# E-Garage Email Testing

This document provides information about testing email functionality in the E-Garage application.

## Overview

E-Garage uses email for various features such as:
- User registration verification
- Password reset
- Login notifications
- Booking confirmations
- Service updates

For testing purposes, we have several options for testing email functionality, including the use of Yopmail.

## Email Testing Tools

### 1. Yopmail Browser Automation (Recommended)

The most reliable way to get test emails in your Yopmail inbox:

```
cd backend
yopmail_test.bat
```

This tool:
- Uses Selenium to automate a web browser
- Navigates to Yopmail.com
- Directly places an email in your inbox
- Shows the email in the actual Yopmail interface

Requirements:
- Python with Selenium installed (the script will install it if missing)
- Chrome browser installed

### 2. Email API Services

For sending real emails to Yopmail:

```
cd backend
python yopmail_direct.py recipient-name -s "Subject" --html "<p>Content</p>"
```

To use this method:
1. Sign up for a free account at Mailgun or SendGrid
2. Add your API key to the script
3. Use the script to send real emails to Yopmail addresses

### 3. Email Testing Utility (`email_test.bat`)

A comprehensive batch utility with a menu-driven interface that provides:

- Basic email tests using the original `test_yopmail.py` script
- Advanced email tests with custom subjects and content
- Email configuration display
- Viewing of previous email test results

To use, run:
```
cd backend
email_test.bat
```

### 4. Quick Test Script (`test_yopmail.bat`)

A simple batch file for quick testing:

```
cd backend
test_yopmail.bat
```

### 5. Python Test Scripts

- `test_yopmail.py`: Original script for basic email testing
- `send_test_email.py`: Advanced script with more options
- `automate_yopmail.py`: Direct browser automation to place emails in Yopmail
- `send_to_yopmail.py`: Uses a third-party SMTP service
- `yopmail_direct.py`: Uses email API services (Mailgun/SendGrid)

You can run them directly:

```
# Basic test (saves local HTML)
python test_yopmail.py recipient@example.com

# Advanced test (saves local HTML)
python send_test_email.py recipient@example.com -s "Custom Subject" -c "<h1>Custom HTML Content</h1>"

# Browser automation (puts email directly in Yopmail)
python automate_yopmail.py username -s "Subject Line"
```

## Email Configuration

Email settings are configured in the `.env` file. We provide multiple configuration options:

### 1. Yopmail Configuration (Local Testing Only)
```
EMAIL_HOST = smtp.yopmail.com
EMAIL_PORT = 587
EMAIL_HOST_USER = e-garage@yopmail.com
EMAIL_HOST_PASSWORD = 
EMAIL_USE_TLS = True
LOG_EMAILS = True
SEND_REAL_EMAILS = False
```
Note: This configuration will not actually send emails to Yopmail (as Yopmail doesn't have an SMTP server), but will save them locally as HTML files.

### 2. Mailtrap Configuration (Recommended for Development)
```
EMAIL_HOST = sandbox.smtp.mailtrap.io
EMAIL_PORT = 2525
EMAIL_HOST_USER = YOUR_MAILTRAP_USERNAME
EMAIL_HOST_PASSWORD = YOUR_MAILTRAP_PASSWORD
EMAIL_USE_TLS = True
LOG_EMAILS = True
SEND_REAL_EMAILS = True
```

### 3. Real Email Service (Production)
```
EMAIL_HOST = smtp.gmail.com  # Or your preferred provider
EMAIL_PORT = 587
EMAIL_HOST_USER = your-email@gmail.com
EMAIL_HOST_PASSWORD = your-app-password
EMAIL_USE_TLS = True
LOG_EMAILS = True
SEND_REAL_EMAILS = True
```

## Checking Test Emails

There are multiple ways to check test emails:

1. **Local HTML Files**: All test emails are saved to the `emails` directory as HTML files for easy inspection.

2. **Yopmail Web Interface**: When using the automation tools or sending real emails to a Yopmail address:
   ```
   https://yopmail.com/en/
   ```
   Enter the recipient email address used in your test to see received messages.

3. **Mailtrap Dashboard**: When using Mailtrap configuration:
   ```
   https://mailtrap.io/
   ```
   Login to your account to see all captured emails.

## Troubleshooting

If you encounter issues:

1. **Emails Not Appearing in Yopmail**:
   - Yopmail doesn't have an SMTP server, so direct SMTP connections will fail
   - Use the `automate_yopmail.py` script instead which directly places emails in the inbox
   - Or use a real email service configured to send to Yopmail addresses

2. **Local HTML Files**:
   - Check the `emails` directory for HTML files
   - Look for files with "failed" in the name to diagnose issues

3. **Connection Errors**:
   - Verify your `.env` file has the correct email configuration
   - For Mailtrap or real email services, verify credentials are correct
   - Check for firewall or network restrictions blocking outgoing SMTP connections

4. **Package Dependencies**:
   - Ensure Python and required packages are installed
   - For Selenium automation: `pip install selenium`
   - For API services: `pip install requests` or `pip install sendgrid`

## Development Notes

When implementing new email features:

1. Always test using the email testing tools
2. Save templates in the `templates` directory
3. Use the `EmailSender` class in `Sendmail.py` for sending emails
4. Set `LOG_EMAILS = True` during development to log instead of sending
5. Only set `SEND_REAL_EMAILS = True` in production 