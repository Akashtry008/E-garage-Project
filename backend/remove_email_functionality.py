import os
import re
import sys
import shutil
from pathlib import Path

def backup_file(file_path):
    """Create a backup of a file before modifying it."""
    backup_path = f"{file_path}.bak"
    if os.path.exists(file_path):
        shutil.copy2(file_path, backup_path)
        print(f"✅ Backed up {file_path} to {backup_path}")
        return True
    return False

def modify_sendmail(file_path="utils/Sendmail.py"):
    """Modify the Sendmail.py file to disable actual sending."""
    if not os.path.exists(file_path):
        file_path = f"backend/{file_path}"
    
    if not os.path.exists(file_path):
        print(f"❌ Could not find Sendmail.py at {file_path}")
        return False
    
    # Backup first
    backup_file(file_path)
    
    # Read the file
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Replace the send_mail function to only log emails
    new_send_mail = '''def send_mail(to_email: str, subject: str, text: str):
    """Send an email with better error handling and fallback to logging.
    This version ONLY logs emails to files and never sends them.
    Returns True always, as if the email was sent.
    """
    try:
        logger.info(f"Email logging: would have sent email to {to_email}")
        logger.info(f"Subject: {subject}")
        
        # Create email message for logging purposes
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(text, 'html'))
        
        # Log the email content
        email_log = {
            "to": to_email,
            "subject": subject,
            "body": text[:500] + "..." if len(text) > 500 else text,
            "timestamp": str(datetime.datetime.now())
        }
        
        try:
            # Make the emails_sent.log directory if it doesn't exist
            os.makedirs(os.path.dirname(EMAIL_LOG_PATH), exist_ok=True)
            
            with open(EMAIL_LOG_PATH, "a") as f:
                f.write(json.dumps(email_log) + "\\n")
            logger.info(f"Email logged to {EMAIL_LOG_PATH}")
            
            # Create a simple HTML file with the email content for easy viewing
            html_filename = f"email_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            html_path = os.path.join(BASE_DIR, "emails", html_filename)
            os.makedirs(os.path.dirname(html_path), exist_ok=True)
            
            with open(html_path, "w") as f:
                f.write(f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Email to {to_email}</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; margin: 20px; }}
                        .email-container {{ border: 1px solid #ddd; padding: 20px; }}
                        .header {{ background: #f8f8f8; padding: 10px; margin-bottom: 20px; }}
                        .content {{ padding: 10px; }}
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <strong>To:</strong> {to_email}<br>
                            <strong>From:</strong> {SMTP_EMAIL}<br>
                            <strong>Subject:</strong> {subject}<br>
                            <strong>Date:</strong> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                        </div>
                        <div class="content">
                            {text}
                        </div>
                    </div>
                </body>
                </html>
                """)
            logger.info(f"Email content saved as HTML at {html_path}")
            
            print(f"✓ Email to {to_email} saved to {html_path}")
            print(f"  Check this file to see what would have been sent")
            
        except Exception as log_error:
            logger.error(f"Failed to log email: {str(log_error)}")
        
        return True
    except Exception as e:
        logger.error(f"Error logging email to {to_email}: {str(e)}")
        return False'''
    
    # Replace the send_mail function
    content = re.sub(r'def send_mail\([^)]*\):\s*"""[^"]*""".*?return False', 
                     new_send_mail, 
                     content, 
                     flags=re.DOTALL)
    
    # Set SEND_REAL_EMAILS to False
    content = re.sub(r'SEND_REAL_EMAILS\s*=\s*os.getenv\([^)]*\)',
                    'SEND_REAL_EMAILS = False  # Always false - emails are only logged', 
                    content)
    
    # Write the modified file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"✅ Modified {file_path} - emails will now only be logged to files")
    return True

def modify_env_file(file_path=".env"):
    """Modify the .env file to disable email sending."""
    if not os.path.exists(file_path):
        file_path = f"backend/{file_path}"
    
    if not os.path.exists(file_path):
        print(f"❌ Could not find .env file at {file_path}")
        return False
    
    # Backup first
    backup_file(file_path)
    
    # Read the file
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    # Modify email settings
    new_lines = []
    for line in lines:
        if line.strip().startswith("SEND_REAL_EMAILS"):
            new_lines.append("SEND_REAL_EMAILS = False  # Email functionality disabled\n")
        elif line.strip().startswith("EMAIL_HOST") or line.strip().startswith("EMAIL_PORT") or line.strip().startswith("EMAIL_HOST_USER") or line.strip().startswith("EMAIL_HOST_PASSWORD"):
            new_lines.append(f"# {line}")
        else:
            new_lines.append(line)
    
    # Write the modified file
    with open(file_path, 'w') as f:
        f.writelines(new_lines)
    
    print(f"✅ Modified {file_path} - disabled email sending in environment settings")
    return True

def create_email_viewer():
    """Create a simple HTML file to view saved emails."""
    viewer_path = "backend/emails/viewer.html"
    
    # Create emails directory if it doesn't exist
    os.makedirs(os.path.dirname(viewer_path), exist_ok=True)
    
    html_content = """<!DOCTYPE html>
<html>
<head>
    <title>E-Garage Email Viewer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .email-list { margin: 20px 0; }
        .email-item { margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .email-item:hover { background-color: #f9f9f9; }
        .email-subject { font-weight: bold; }
        .email-date { color: #666; font-size: 0.9em; }
        .email-frame { width: 100%; height: 600px; border: 1px solid #ddd; margin-top: 20px; }
    </style>
    <script>
        function loadEmailList() {
            fetch('file-list.php')
                .then(response => response.json())
                .then(data => {
                    const emailList = document.getElementById('email-list');
                    emailList.innerHTML = '';
                    
                    if (data.length === 0) {
                        emailList.innerHTML = '<p>No emails found. Check the emails directory.</p>';
                        return;
                    }
                    
                    data.forEach(file => {
                        const item = document.createElement('div');
                        item.className = 'email-item';
                        item.innerHTML = `
                            <div class="email-subject">${file.subject || 'No Subject'}</div>
                            <div>To: ${file.to || 'Unknown Recipient'}</div>
                            <div class="email-date">${file.date || 'Unknown Date'}</div>
                        `;
                        item.onclick = () => viewEmail(file.path);
                        emailList.appendChild(item);
                    });
                })
                .catch(error => {
                    console.error('Error loading email list:', error);
                    document.getElementById('email-list').innerHTML = 
                        '<p>Error loading emails. To use this viewer, manually open the HTML files in the emails directory.</p>';
                });
        }
        
        function viewEmail(path) {
            document.getElementById('email-frame').src = path;
        }
        
        // For local usage without a server
        function manualInstructions() {
            document.getElementById('email-list').innerHTML = `
                <p>To view emails:</p>
                <ol>
                    <li>Go to the emails directory</li>
                    <li>Open any HTML file directly in your browser</li>
                </ol>
                <p>These are emails that would have been sent if email functionality was enabled.</p>
            `;
        }
        
        window.onload = function() {
            // Try to load the email list, but show manual instructions by default
            manualInstructions();
            //loadEmailList(); // Uncomment if using with a web server
        }
    </script>
</head>
<body>
    <h1>E-Garage Email Viewer</h1>
    <p>This viewer shows emails that would have been sent if email functionality was enabled.</p>
    
    <div class="email-list" id="email-list">
        <p>Loading emails...</p>
    </div>
    
    <iframe id="email-frame" class="email-frame" name="email-frame"></iframe>
</body>
</html>"""
    
    with open(viewer_path, 'w') as f:
        f.write(html_content)
    
    print(f"✅ Created email viewer at {viewer_path}")
    return True

def main():
    print("==================================================================")
    print("            REMOVING EMAIL FUNCTIONALITY FROM E-GARAGE")
    print("==================================================================")
    print()
    print("This script will modify your application to:")
    print("1. Disable actual email sending")
    print("2. Save all emails as HTML files for viewing")
    print("3. Create a viewer for seeing what would have been sent")
    print()
    
    # Get confirmation
    response = input("Do you want to proceed? (y/n): ")
    if response.lower() != 'y':
        print("Operation cancelled.")
        return
    
    # Modify files
    modify_sendmail()
    modify_env_file()
    create_email_viewer()
    
    print()
    print("==================================================================")
    print("                       OPERATION COMPLETE")
    print("==================================================================")
    print()
    print("Email functionality has been disabled. All emails will now be:")
    print("1. Logged to the console")
    print("2. Saved as HTML files in the 'emails' directory")
    print()
    print("To view emails that would have been sent:")
    print("- Open any HTML file in the 'emails' directory")
    print("- Or open emails/viewer.html in a browser")
    print()
    print("To restore original functionality:")
    print("- Restore the .bak files that were created")
    print("- Or re-enable settings in .env and Sendmail.py")
    
if __name__ == "__main__":
    main() 