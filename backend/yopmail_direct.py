import requests
import json
import logging
import sys
import time
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def send_to_yopmail(recipient_email, subject="E-Garage Test Email", html_content=None):
    """
    Send email directly to a Yopmail inbox using an email API service.
    
    This function uses Mailgun's API to send emails to Yopmail addresses.
    You need to sign up for a free Mailgun account to use this.
    
    Returns True if successful, False otherwise.
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
            <hr>
            <p><small>Sent via Mailgun API</small></p>
        </body>
        </html>
        """
    
    # ===== OPTION 1: MAILGUN =====
    # Sign up for free at mailgun.com and get your API key and domain
    MAILGUN_API_KEY = "YOUR_MAILGUN_API_KEY"  # Replace with your API key
    MAILGUN_DOMAIN = "YOUR_MAILGUN_DOMAIN"    # Replace with your domain
    
    try:
        logger.info(f"Sending email to {recipient_email} via Mailgun...")
        
        response = requests.post(
            f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
            auth=("api", MAILGUN_API_KEY),
            data={
                "from": f"E-Garage <noreply@{MAILGUN_DOMAIN}>",
                "to": [recipient_email],
                "subject": subject,
                "html": html_content
            }
        )
        
        if response.status_code == 200:
            logger.info(f"Email sent successfully to {recipient_email}")
            
            # Save email to file for backup
            emails_dir = Path("emails")
            emails_dir.mkdir(exist_ok=True)
            
            timestamp = time.strftime('%Y%m%d%H%M%S')
            filename = emails_dir / f"sent_to_yopmail_{timestamp}.html"
            
            with open(filename, 'w') as f:
                f.write(f"To: {recipient_email}\n")
                f.write(f"Subject: {subject}\n\n")
                f.write(html_content)
            
            logger.info(f"Email saved to {filename}")
            
            print(f"\n✅ Email sent successfully to {recipient_email}!")
            print(f"Check your Yopmail inbox at: https://yopmail.com/en/?login={recipient_email.split('@')[0]}")
            return True
        else:
            error_msg = f"Failed to send email: {response.status_code} - {response.text}"
            logger.error(error_msg)
            print(f"\n❌ {error_msg}")
            return False
    
    except Exception as e:
        error_msg = f"Error sending email: {str(e)}"
        logger.error(error_msg)
        
        # Save the email that would have been sent for debugging
        emails_dir = Path("emails")
        emails_dir.mkdir(exist_ok=True)
        
        timestamp = time.strftime('%Y%m%d%H%M%S')
        filename = emails_dir / f"failed_yopmail_{timestamp}.html"
        
        with open(filename, 'w') as f:
            f.write(f"ERROR: {str(e)}\n\n")
            f.write(f"To: {recipient_email}\n")
            f.write(f"Subject: {subject}\n\n")
            f.write(html_content)
        
        logger.info(f"Failed email content saved to {filename}")
        
        print(f"\n❌ {error_msg}")
        print(f"Check the emails directory for the saved email content.")
        return False

# ===== Alternative Method Using Sendgrid =====
def send_via_sendgrid(recipient_email, subject="E-Garage Test Email", html_content=None):
    """
    Send email using SendGrid API (alternative to Mailgun)
    """
    try:
        # Default HTML content if none provided
        if not html_content:
            html_content = f"""
            <html>
            <body>
                <h1>E-Garage Email Test</h1>
                <p>This is a test email from E-Garage application.</p>
                <p>If you're seeing this, the email configuration is working correctly!</p>
                <p>Time sent: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
                <hr>
                <p><small>Sent via SendGrid API</small></p>
            </body>
            </html>
            """
        
        # First try to import SendGrid - if not installed, guide user to install it
        try:
            import sendgrid
            from sendgrid.helpers.mail import Mail, Email, To, Content
        except ImportError:
            logger.error("SendGrid package not installed. Install with: pip install sendgrid")
            print("\n❌ SendGrid package not installed. Run: pip install sendgrid")
            return False
        
        # Set your API key here - get one from sendgrid.com (free tier available)
        SENDGRID_API_KEY = "YOUR_SENDGRID_API_KEY"
        
        # Create a Mail object
        from_email = Email("noreply@e-garage.example.com")  # Replace with your sender
        to_email = To(recipient_email)
        content = Content("text/html", html_content)
        mail = Mail(from_email, to_email, subject, content)
        
        # Send the email
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        response = sg.client.mail.send.post(request_body=mail.get())
        
        if response.status_code in [200, 201, 202]:
            logger.info(f"Email sent successfully to {recipient_email} via SendGrid")
            return True
        else:
            logger.error(f"Failed to send via SendGrid: {response.status_code} - {response.body}")
            return False
            
    except Exception as e:
        logger.error(f"Error using SendGrid: {str(e)}")
        return False
        
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python yopmail_direct.py <recipient_email> [subject] [html_content_file]")
        print("Example: python yopmail_direct.py test@yopmail.com \"Test Subject\" email_template.html")
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