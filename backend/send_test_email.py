import os
import smtplib
import logging
import time
import argparse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def send_test_email(recipient_email, subject=None, content=None):
    """
    Send a test email using the configured email settings.
    
    Args:
        recipient_email (str): The email address to send the test to
        subject (str, optional): Custom subject line
        content (str, optional): Custom email content
    
    Returns:
        tuple: (success: bool, message: str)
    """
    # Get email configuration from environment variables
    EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.yopmail.com")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
    EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "e-garage@yopmail.com")
    EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
    
    # Print configuration for debugging
    logger.info(f"SMTP Configuration:")
    logger.info(f"Host: {EMAIL_HOST}")
    logger.info(f"Port: {EMAIL_PORT}")
    logger.info(f"User: {EMAIL_HOST_USER}")
    logger.info(f"TLS: {EMAIL_USE_TLS}")
    
    # Create email message
    msg = MIMEMultipart()
    msg['From'] = EMAIL_HOST_USER
    msg['To'] = recipient_email
    msg['Subject'] = subject or "E-Garage Test Email"
    
    # Email body
    default_body = f"""
    <html>
    <body>
        <h1>E-Garage Email Test</h1>
        <p>This is a test email from E-Garage application.</p>
        <p>If you're seeing this, the email configuration is working correctly!</p>
        <p>Time sent: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
        <hr>
        <p><small>This email was sent from the E-Garage application using the send_test_email.py script.</small></p>
    </body>
    </html>
    """
    
    body = content or default_body
    msg.attach(MIMEText(body, 'html'))
    
    try:
        # Connect to SMTP server
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.set_debuglevel(1)  # Enable debugging for detailed output
        
        if EMAIL_USE_TLS:
            server.starttls()
        
        # Login if credentials provided
        if EMAIL_HOST_USER and EMAIL_HOST_PASSWORD:
            server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        
        # Send email
        text = msg.as_string()
        server.sendmail(EMAIL_HOST_USER, recipient_email, text)
        logger.info(f"Email sent successfully to {recipient_email}")
        
        # Save email to file for verification
        emails_dir = Path("emails")
        emails_dir.mkdir(exist_ok=True)
        
        timestamp = time.strftime('%Y%m%d%H%M%S')
        filename = emails_dir / f"test_email_{timestamp}.html"
        
        with open(filename, 'w') as f:
            f.write(f"To: {recipient_email}\n")
            f.write(f"Subject: {msg['Subject']}\n\n")
            f.write(body)
        
        logger.info(f"Email saved to {filename}")
        
        # Close connection
        server.quit()
        return True, f"Email sent successfully to {recipient_email} and saved to {filename}"
        
    except Exception as e:
        error_msg = f"Failed to send email: {str(e)}"
        logger.error(error_msg)
        
        # Save the email that would have been sent for debugging
        emails_dir = Path("emails")
        emails_dir.mkdir(exist_ok=True)
        
        timestamp = time.strftime('%Y%m%d%H%M%S')
        filename = emails_dir / f"failed_email_{timestamp}.html"
        
        with open(filename, 'w') as f:
            f.write(f"ERROR: {str(e)}\n\n")
            f.write(f"To: {recipient_email}\n")
            f.write(f"Subject: {msg['Subject']}\n\n")
            f.write(body)
        
        logger.info(f"Failed email content saved to {filename}")
        return False, error_msg

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Send a test email using E-Garage email configuration')
    parser.add_argument('recipient', help='Recipient email address')
    parser.add_argument('-s', '--subject', help='Custom subject line')
    parser.add_argument('-c', '--content', help='Custom email content (HTML supported)')
    
    args = parser.parse_args()
    
    success, message = send_test_email(args.recipient, args.subject, args.content)
    
    if success:
        print("\n✅ " + message)
        exit(0)
    else:
        print("\n❌ " + message)
        print("Check the emails directory for the saved email content.")
        exit(1) 