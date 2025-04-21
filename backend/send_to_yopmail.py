import os
import smtplib
import logging
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
import sys

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def send_to_yopmail(recipient_email, subject="E-Garage Test Email", html_content=None):
    """
    Send an email to a Yopmail address using a working SMTP relay.
    
    This function uses smtp2go.com as a free SMTP relay that can deliver to Yopmail addresses.
    You can create a free account at smtp2go.com to get credentials.
    """
    # Default HTML content if none provided
    if not html_content:
        html_content = f"""
        <html>
        <body>
            <h1>E-Garage Email Test</h1>
            <p>This is a test email from E-Garage application.</p>
            <p>If you're seeing this, the email configuration is working correctly!</p>
            <p>Time sent: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
        </body>
        </html>
        """
    
    # SMTP configuration for smtp2go (or another working service)
    # Note: For this to work, you need to:
    # 1. Create a free account at smtp2go.com
    # 2. Replace the credentials below with your own
    # 3. Or use another SMTP service that you have access to
    SMTP_SERVER = "mail.smtp2go.com"  # Replace with your SMTP server
    SMTP_PORT = 2525  # Common alternative port for SMTP
    SMTP_USER = "your_smtp2go_username"  # Replace with your username
    SMTP_PASSWORD = "your_smtp2go_password"  # Replace with your password
    SENDER_EMAIL = "noreply@e-garage.example.com"  # Replace with sender email
    
    # Print configuration for debugging
    logger.info(f"SMTP Configuration:")
    logger.info(f"Host: {SMTP_SERVER}")
    logger.info(f"Port: {SMTP_PORT}")
    
    # Create email message
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = recipient_email
    msg['Subject'] = subject
    
    # Attach HTML content
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        # Connect to SMTP server
        logger.info(f"Connecting to SMTP server {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.set_debuglevel(1)  # Enable debugging for detailed output
        
        # Start TLS for security (if supported)
        try:
            server.starttls()
            logger.info("TLS started successfully")
        except smtplib.SMTPNotSupportedError:
            logger.warning("TLS not supported by server, continuing with unencrypted connection")
        
        # Login with credentials
        logger.info(f"Logging in as {SMTP_USER}...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        
        # Send email
        logger.info(f"Sending email to {recipient_email}...")
        server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        
        # Save email to file for backup
        emails_dir = Path("emails")
        emails_dir.mkdir(exist_ok=True)
        
        timestamp = time.strftime('%Y%m%d%H%M%S')
        filename = emails_dir / f"sent_to_yopmail_{timestamp}.html"
        
        with open(filename, 'w') as f:
            f.write(f"To: {recipient_email}\n")
            f.write(f"Subject: {msg['Subject']}\n\n")
            f.write(html_content)
        
        logger.info(f"Email saved to {filename}")
        
        # Close connection
        server.quit()
        
        print(f"\n✅ Email sent successfully to {recipient_email}!")
        print(f"Check your Yopmail inbox at: https://yopmail.com/en/?login={recipient_email.split('@')[0]}")
        return True
        
    except Exception as e:
        error_msg = f"Failed to send email: {str(e)}"
        logger.error(error_msg)
        
        # Save the email that would have been sent for debugging
        emails_dir = Path("emails")
        emails_dir.mkdir(exist_ok=True)
        
        timestamp = time.strftime('%Y%m%d%H%M%S')
        filename = emails_dir / f"failed_yopmail_{timestamp}.html"
        
        with open(filename, 'w') as f:
            f.write(f"ERROR: {str(e)}\n\n")
            f.write(f"To: {recipient_email}\n")
            f.write(f"Subject: {msg['Subject']}\n\n")
            f.write(html_content)
        
        logger.info(f"Failed email content saved to {filename}")
        
        print(f"\n❌ {error_msg}")
        print(f"Check the emails directory for the saved email content.")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python send_to_yopmail.py <recipient_email> [subject] [html_content_file]")
        sys.exit(1)
    
    recipient_email = sys.argv[1]
    subject = sys.argv[2] if len(sys.argv) > 2 else "E-Garage Test Email"
    
    html_content = None
    if len(sys.argv) > 3:
        # If a file path is provided, read the HTML content from it
        html_file = sys.argv[3]
        try:
            with open(html_file, 'r') as f:
                html_content = f.read()
        except Exception as e:
            print(f"Error reading HTML file: {str(e)}")
            sys.exit(1)
    
    success = send_to_yopmail(recipient_email, subject, html_content)
    sys.exit(0 if success else 1) 