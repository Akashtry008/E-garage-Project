import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys
import time
from pathlib import Path

def send_to_yopmail(recipient, subject="E-Garage Test Email", html_content=None):
    """
    Send email to a Yopmail address using a real email service.
    
    This function requires a Gmail account with "Less secure app access" enabled,
    or you can use your own SMTP server credentials.
    
    Args:
        recipient: Email address to send to (typically @yopmail.com)
        subject: Email subject line
        html_content: HTML content of the email
        
    Returns:
        True if successful, False otherwise
    """
    # Default email content if none provided
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
    
    # SMTP Configuration - REPLACE THESE WITH YOUR OWN
    # -----------------------------------------------
    # To use Gmail:
    # 1. Enable "Less secure app access" in your Google account
    # 2. Or create an App Password if using 2FA
    # -----------------------------------------------
    sender_email = "YOUR_EMAIL@gmail.com"  # Replace with your Gmail address
    password = "YOUR_PASSWORD"             # Replace with your Gmail password or App Password
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    
    # Create message
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = recipient
    
    # Turn the HTML content into a MIME part
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)
    
    # Save a copy to disk
    emails_dir = Path("emails")
    emails_dir.mkdir(exist_ok=True)
    
    timestamp = time.strftime('%Y%m%d%H%M%S')
    filename = emails_dir / f"yopmail_{timestamp}.html"
    
    with open(filename, 'w') as f:
        f.write(f"To: {recipient}\n")
        f.write(f"Subject: {subject}\n\n")
        f.write(html_content)
    
    print(f"Email saved locally to: {filename}")
    
    try:
        # Connect to SMTP server
        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(sender_email, password)
            server.sendmail(sender_email, recipient, message.as_string())
        
        print(f"\n✅ Email sent successfully to {recipient}!")
        print(f"Check your Yopmail inbox at: https://yopmail.com/en/?login={recipient.split('@')[0]}")
        return True
        
    except Exception as e:
        print(f"\n❌ Failed to send email: {str(e)}")
        print(f"The email content was saved locally to: {filename}")
        print("You need to configure this script with your own email credentials.")
        print("\nOptions:")
        print("1. Edit this file and add your Gmail or other email credentials")
        print("2. Sign up for a free SMTP service like SendGrid or Mailgun")
        print("3. Use a local email client to send messages to Yopmail manually")
        return False

def print_instructions():
    """Print instructions for using this script"""
    print("""
=====================================================
           SEND EMAIL TO YOPMAIL
=====================================================

This script sends emails to Yopmail addresses using a real email service.
To make this work, you need to edit this script and add your own email
credentials (e.g., Gmail, Outlook, or an SMTP service provider).

Usage:
  python simple_yopmail.py <recipient@yopmail.com> [subject]

Example:
  python simple_yopmail.py test@yopmail.com "Test Subject"

IMPORTANT: Before using, edit this file and replace these values:
  - sender_email: Your email address (e.g., your.email@gmail.com)
  - password: Your email password or app password
  - smtp_server: Your SMTP server (default: smtp.gmail.com)
  - smtp_port: Your SMTP port (default: 587)

=====================================================
""")

if __name__ == "__main__":
    # If no arguments, print instructions
    if len(sys.argv) < 2:
        print_instructions()
        sys.exit(1)
    
    # Get recipient email
    recipient = sys.argv[1]
    if "@" not in recipient:
        recipient = f"{recipient}@yopmail.com"
    
    # Get subject (optional)
    subject = sys.argv[2] if len(sys.argv) > 2 else "E-Garage Test Email"
    
    # Send email
    success = send_to_yopmail(recipient, subject)
    sys.exit(0 if success else 1) 