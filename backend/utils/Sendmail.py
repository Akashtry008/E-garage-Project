"""
Email sending functionality for E-Garage application.
Emails are saved as HTML files in the emails directory.
"""

import os
import smtplib
import logging
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Email configuration
SMTP_SERVER = os.getenv("EMAIL_HOST", "smtp.yopmail.com")
SMTP_PORT = int(os.getenv("EMAIL_PORT", 587))
SMTP_EMAIL = os.getenv("EMAIL_HOST_USER", "e-garage@yopmail.com")
SMTP_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
SEND_REAL_EMAILS = os.getenv("SEND_REAL_EMAILS", "False").lower() == "true"
LOG_EMAILS = os.getenv("LOG_EMAILS", "True").lower() == "true"

def send_mail(recipient, subject, body, sender=None):
    """
    Send an email or save it as HTML file if email sending is disabled.
    
    Args:
        recipient (str): The recipient email address
        subject (str): The email subject
        body (str): The HTML body of the email
        sender (str, optional): The sender email address. Defaults to SMTP_EMAIL.
    
    Returns:
        bool: True if email was successfully sent or logged, False otherwise
    """
    if sender is None:
        sender = SMTP_EMAIL

    # Log the email
    if LOG_EMAILS:
        logger.info(f"Email: To: {recipient}, Subject: {subject}")
        
        # Try multiple locations for the emails directory
        emails_dir = Path("emails")
        if not emails_dir.exists():
            emails_dir = Path("backend/emails")
            
        # Create the directory if it doesn't exist
        try:
            emails_dir.mkdir(exist_ok=True, parents=True)
            logger.info(f"Using emails directory: {emails_dir.absolute()}")
        except Exception as e:
            logger.error(f"Failed to create emails directory: {str(e)}")
            # Try creating in current directory as fallback
            emails_dir = Path(".")
        
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        filename = emails_dir / f"email_{timestamp}.html"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"To: {recipient}\n")
                f.write(f"From: {sender}\n")
                f.write(f"Subject: {subject}\n")
                f.write(f"Date: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(body)
            
            logger.info(f"Email saved to {filename}")
        except Exception as e:
            logger.error(f"Failed to save email to file: {str(e)}")
            return False
    
    # Return early if not sending real emails
    if not SEND_REAL_EMAILS:
        logger.info("Email sending is disabled. Email content saved to file only.")
        return True
    
    # Proceed with sending the actual email
    try:
        msg = MIMEMultipart()
        msg['From'] = sender
        msg['To'] = recipient
        msg['Subject'] = subject
        
        # Attach HTML body
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to SMTP server and send
        logger.info(f"Connecting to SMTP server {SMTP_SERVER}:{SMTP_PORT}")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        
        if os.getenv("EMAIL_USE_TLS", "True").lower() == "true":
            server.starttls()
        
        if SMTP_PASSWORD:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
        
        server.sendmail(sender, recipient, msg.as_string())
        server.quit()
        
        logger.info(f"Email sent successfully to {recipient}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        
        # Try multiple locations for the emails directory for failed emails
        emails_dir = Path("emails")
        if not emails_dir.exists():
            emails_dir = Path("backend/emails")
            
        # Create the directory if it doesn't exist
        try:
            emails_dir.mkdir(exist_ok=True, parents=True)
        except Exception as dir_error:
            logger.error(f"Failed to create emails directory for failed email: {str(dir_error)}")
            # Try creating in current directory as fallback
            emails_dir = Path(".")
        
        timestamp = time.strftime('%Y%m%d%H%M%S')
        filename = emails_dir / f"failed_email_{timestamp}.html"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"ERROR: {str(e)}\n\n")
                f.write(f"To: {recipient}\n")
                f.write(f"Subject: {subject}\n\n")
                f.write(body)
            
            logger.info(f"Failed email content saved to {filename}")
        except Exception as write_error:
            logger.error(f"Failed to save failed email to file: {str(write_error)}")
            
            return False

class EmailSender:
    """Static class for sending various types of emails"""
    
    @staticmethod
    def send_verification_email(email, verification_code):
        """Send email verification code to user"""
        subject = "E-Garage: Verify Your Email"
        body = f"""
        <html>
        <body>
            <h2>Email Verification</h2>
            <p>Thank you for registering with E-Garage!</p>
            <p>Your verification code is: <strong>{verification_code}</strong></p>
            <p>Please enter this code in the verification form to complete your registration.</p>
            <p>If you did not request this verification, please ignore this email.</p>
            <p>Best regards,<br>E-Garage Team</p>
        </body>
        </html>
        """
        return send_mail(email, subject, body)
    
    @staticmethod
    def send_password_reset_notification(email, reset_link):
        """Send password reset notification to admin"""
        admin_email = os.getenv("ADMIN_EMAIL", "admin@e-garage.com")
        subject = "E-Garage: Password Reset Request"
        body = f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>A password reset was requested for: {email}</p>
            <p>Reset link: <a href="{reset_link}">{reset_link}</a></p>
            <p>If this was not expected, please investigate.</p>
            <p>Best regards,<br>E-Garage System</p>
        </body>
        </html>
        """
        return send_mail(admin_email, subject, body)
    
    @staticmethod
    def send_password_reset_email(email, reset_link):
        """Send password reset link to user"""
        subject = "E-Garage: Password Reset Request"
        body = f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password for your E-Garage account.</p>
            <p>Please click the link below to reset your password:</p>
            <p><a href="{reset_link}">Reset My Password</a></p>
            <p>Or copy and paste this URL into your browser:</p>
            <p>{reset_link}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
            <p>Best regards,<br>E-Garage Team</p>
        </body>
        </html>
        """
        return send_mail(email, subject, body)
    
    @staticmethod
    def send_login_notification(email):
        """Send login notification to user"""
        subject = "E-Garage: New Login Detected"
        body = f"""
        <html>
        <body>
            <h2>New Login Detected</h2>
            <p>Hello,</p>
            <p>We detected a new login to your E-Garage account.</p>
            <p>Time: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>If this was you, you can safely ignore this email.</p>
            <p>If you did not log in, please contact support immediately as your account may have been compromised.</p>
            <p>Best regards,<br>E-Garage Security Team</p>
        </body>
        </html>
        """
        return send_mail(email, subject, body)
    
    @staticmethod
    def send_booking_confirmation(email, booking_details):
        """Send booking confirmation to user"""
        subject = "E-Garage: Booking Confirmation"
        body = f"""
        <html>
        <body>
            <h2>Booking Confirmation</h2>
            <p>Hello,</p>
            <p>Your booking with E-Garage has been confirmed!</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li>Service: {booking_details.get('service', 'N/A')}</li>
                <li>Date: {booking_details.get('date', 'N/A')}</li>
                <li>Time: {booking_details.get('time', 'N/A')}</li>
                <li>Provider: {booking_details.get('provider', 'N/A')}</li>
            </ul>
            <p>Thank you for choosing E-Garage!</p>
            <p>Best regards,<br>E-Garage Team</p>
        </body>
        </html>
        """
        return send_mail(email, subject, body)
