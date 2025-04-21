# E-Garage Email Troubleshooting Guide

This guide will help you resolve common issues with email sending in the E-Garage application.

## Testing Your Email Configuration

1. Run the email test tool:
   - Windows: Double-click on `run_email_test.bat`
   - Mac/Linux: Open terminal, navigate to the backend directory and run `bash run_email_test.sh`
   
2. Enter your email address when prompted.

3. Check the console output for any errors.

## Using pythondeveloper@yopmail.com (Special Case)

The application has special handling for the `pythondeveloper@yopmail.com` email address:

1. When this email is used as the sender, the system will:
   - NOT attempt to connect to any SMTP server
   - Log all "sent" emails to `backend/emails_sent.log`
   - Create HTML files of all emails in the `backend/emails` directory

2. To view the "sent" emails:
   - Check the `backend/emails` directory for HTML files
   - Open these HTML files in your browser to see exactly how the emails look
   - All emails will be named with a timestamp (e.g., `email_20230101_120000.html`)

3. Benefits of this approach:
   - No need to configure SMTP settings
   - No need for an actual email account
   - Email content is saved for later viewing
   - Emails can be viewed offline

This is the recommended approach for development and testing.

## Common Issues

### 1. Authentication Failures

**Error messages:**
- "SMTPAuthenticationError: (535, b'5.7.8 Username and Password not accepted'"
- "Username and password not accepted"

**Solutions:**
1. **Check your credentials** in the `.env` file:
   - Ensure your email and password are correctly entered with no typos
   - Make sure there are no extra spaces before or after the values

2. **If using Gmail with 2FA**:
   - Regular password won't work
   - Create an App Password:
     1. Go to https://myaccount.google.com/security
     2. Enable 2-Step Verification if not already enabled
     3. Go to https://myaccount.google.com/apppassages
     4. Generate a new app password for "Mail" and "Other" (name it "E-Garage")
     5. Copy the 16-character password to your `.env` file

3. **If using Gmail without 2FA**:
   - Enable "Less secure app access" at https://myaccount.google.com/lesssecureapps
   - Note: Google is gradually phasing this out, so 2FA with App Password is preferred

### 2. Connection Issues

**Error messages:**
- "Connection refused"
- "Network unreachable"
- "Timeout error"

**Solutions:**
1. **Check your firewall/network**:
   - Ensure port 587 (or your configured port) is not blocked
   - If on a corporate network, they might be blocking SMTP

2. **Verify SMTP settings**:
   - For Gmail: `smtp.gmail.com` and port `587`
   - For Outlook: `smtp.office365.com` and port `587`
   - For other providers: Check their documentation

### 3. Emails Sent But Not Received

**Solutions:**
1. **Check spam/junk folder**:
   - Most important step! Email providers often mark automated emails as spam

2. **Check email logs**:
   - Look at the `emails_sent.log` file in the backend directory
   - Verify the email was actually sent

3. **Check Gmail's "Categories"**:
   - Sometimes emails go to "Promotions" or "Updates" tabs

4. **Add sender to contacts**:
   - Adding the sender email to your contacts can prevent it from going to spam

### 4. SEND_REAL_EMAILS Not Working

**Solutions:**
1. **Check .env file**:
   - Make sure `SEND_REAL_EMAILS=True` (capital T)
   - The value is case-sensitive

2. **Check logs**:
   - Look for "DEVELOPMENT MODE: Email not actually sent" in the logs
   - This indicates `SEND_REAL_EMAILS` is still False

## Gmail-Specific Settings

If using Gmail, you might need to:

1. **Allow access to "less secure apps"**:
   - Go to https://myaccount.google.com/lesssecureapps 
   - Turn on "Allow less secure apps"
   - Note: This option is being deprecated by Google

2. **Unlock Captcha**:
   - If you're having persistent auth issues, visit: https://accounts.google.com/DisplayUnlockCaptcha
   - Click "Continue" to allow access

3. **Check Gmail security settings**:
   - Go to https://myaccount.google.com/security
   - Review recent security events to see if Google blocked the login attempt

## Still Having Issues?

If you're still experiencing problems after trying these solutions:

1. Try using a different email provider temporarily to isolate the issue
2. Look at the detailed logs by running the test script directly
3. Consider adjusting your email provider's security settings
4. Verify the SMTP server address and port are correct for your provider

## Using Non-Gmail Providers

### Outlook/Office 365
```
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
```

### Yahoo Mail
```
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Zoho Mail
```
SMTP_SERVER=smtp.zoho.com
SMTP_PORT=587
``` 