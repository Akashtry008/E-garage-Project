import os
import sys
import logging
from dotenv import load_dotenv
from utils.Sendmail import send_mail, SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SEND_REAL_EMAILS

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_email_configuration():
    """
    Test the email configuration by sending a test email
    """
    logger.info("Starting email configuration test...")
    
    # Print environment variables
    logger.info(f"Environment variables loaded: {load_dotenv()}")
    logger.info(f"SMTP Server: {SMTP_SERVER}")
    logger.info(f"SMTP Port: {SMTP_PORT}")
    logger.info(f"SMTP Email: {SMTP_EMAIL}")
    logger.info(f"SEND_REAL_EMAILS: {SEND_REAL_EMAILS}")
    
    # Ask for recipient email
    if len(sys.argv) > 1:
        recipient_email = sys.argv[1]
    else:
        recipient_email = input("Enter recipient email address: ")
    
    # Send test email
    subject = "E-Garage: Test Email"
    body = """
    <html>
    <body>
    <h2>E-Garage Email Test</h2>
    <p>This is a test email from the E-Garage application.</p>
    <p>If you're seeing this, it means the email configuration is working correctly!</p>
    <p>Email Configuration:</p>
    <ul>
        <li>SMTP Server: {}</li>
        <li>SMTP Port: {}</li>
        <li>From Email: {}</li>
    </ul>
    <p>Best regards,<br>E-Garage Team</p>
    </body>
    </html>
    """.format(SMTP_SERVER, SMTP_PORT, SMTP_EMAIL)
    
    logger.info(f"Sending test email to {recipient_email}...")
    result = send_mail(recipient_email, subject, body)
    
    if result:
        logger.info("✅ Test email sent successfully!")
        logger.info(f"Please check the inbox of {recipient_email} for the test email.")
        logger.info("If you don't see it, check your spam/junk folder.")
    else:
        logger.error("❌ Failed to send test email!")
        logger.error("Please check the logs above for error details.")
        logger.error("Common issues:")
        logger.error("1. Incorrect email/password in .env file")
        logger.error("2. Less secure app access not enabled in Gmail")
        logger.error("3. App password not set up (if using 2FA)")
        logger.error("4. Network or firewall issues")

if __name__ == "__main__":
    test_email_configuration() 