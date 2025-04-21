import os
import shutil
from pathlib import Path

def backup_file(file_path):
    """Create a backup of a file before modifying it."""
    backup_path = f"{file_path}.bak"
    if os.path.exists(file_path):
        shutil.copy2(file_path, backup_path)
        print(f"Backed up {file_path} to {backup_path}")
        return True
    return False

def modify_sendmail():
    """Modify the Sendmail.py file to disable actual sending."""
    file_path = "backend/utils/Sendmail.py"
    
    if not os.path.exists(file_path):
        file_path = "utils/Sendmail.py"
    
    if not os.path.exists(file_path):
        print(f"Could not find Sendmail.py")
        return False
    
    # Backup first
    backup_file(file_path)
    
    try:
        # Read the content of the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add a comment at the beginning that email is disabled
        content = "# EMAIL FUNCTIONALITY DISABLED - Emails are only saved as HTML files\n" + content
        
        # Modify the SEND_REAL_EMAILS variable assignment to always be False
        content = content.replace(
            "SEND_REAL_EMAILS = os.getenv(\"SEND_REAL_EMAILS\", \"False\").lower() == \"true\"",
            "SEND_REAL_EMAILS = False  # Always disabled"
        )
        
        # Write the modified content back to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Modified {file_path} - Email sending is now disabled")
        return True
    except Exception as e:
        print(f"Error modifying {file_path}: {str(e)}")
        return False

def modify_env_file():
    """Modify the .env file to disable email sending."""
    file_path = "backend/.env"
    
    if not os.path.exists(file_path):
        file_path = ".env"
    
    if not os.path.exists(file_path):
        print(f"Could not find .env file")
        return False
    
    # Backup first
    backup_file(file_path)
    
    try:
        # Read the lines of the file
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Modify the lines
        new_lines = []
        for line in lines:
            if line.strip().startswith("SEND_REAL_EMAILS"):
                new_lines.append("SEND_REAL_EMAILS = False  # Email functionality disabled\n")
            elif line.strip().startswith(("EMAIL_HOST", "EMAIL_PORT", "EMAIL_HOST_USER", "EMAIL_HOST_PASSWORD")):
                new_lines.append(f"# {line}")  # Comment out email configuration
            else:
                new_lines.append(line)
        
        # Write the modified lines back to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        print(f"Modified {file_path} - Email settings are now disabled")
        return True
    except Exception as e:
        print(f"Error modifying {file_path}: {str(e)}")
        return False

def create_email_dir():
    """Create the emails directory for storing email HTML files."""
    emails_dir = "backend/emails"
    
    if not os.path.exists(emails_dir):
        os.makedirs(emails_dir, exist_ok=True)
        print(f"Created directory {emails_dir} for storing email HTML files")
    else:
        print(f"Directory {emails_dir} already exists")
    
    # Create a README file in the emails directory
    readme_path = os.path.join(emails_dir, "README.txt")
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write("""EMAIL FUNCTIONALITY DISABLED

Emails are no longer sent in this application. Instead, they are saved as HTML files in this directory.
To view an email, simply open any HTML file in this directory with your web browser.

Each file contains the email that would have been sent if the email functionality was enabled.
""")
    
    print(f"Created README file at {readme_path}")
    return True

def main():
    print("===============================================================")
    print("           DISABLING EMAIL FUNCTIONALITY IN E-GARAGE")
    print("===============================================================")
    print()
    print("This script will:")
    print("1. Disable actual email sending")
    print("2. Configure the application to save emails as HTML files")
    print("3. Create a directory for storing the email HTML files")
    print()
    
    choice = input("Do you want to proceed? (y/n): ")
    if choice.lower() != 'y':
        print("Operation cancelled.")
        return
    
    success = True
    
    # Modify the Sendmail.py file
    if not modify_sendmail():
        success = False
    
    # Modify the .env file
    if not modify_env_file():
        success = False
    
    # Create the emails directory
    if not create_email_dir():
        success = False
    
    print()
    if success:
        print("===============================================================")
        print("                OPERATION COMPLETED SUCCESSFULLY")
        print("===============================================================")
        print()
        print("Email functionality has been disabled.")
        print("All emails will now be saved as HTML files in the 'backend/emails' directory.")
        print()
        print("To view emails:")
        print("1. Navigate to the 'backend/emails' directory")
        print("2. Open any HTML file with your web browser")
        print()
        print("To restore original functionality:")
        print("1. Restore the .bak files that were created")
        print("2. Or edit the files manually to re-enable email sending")
    else:
        print("===============================================================")
        print("           OPERATION COMPLETED WITH SOME ERRORS")
        print("===============================================================")
        print()
        print("Some steps failed. Email functionality may not be fully disabled.")
        print("Please check the error messages above for details.")
    
    print()

if __name__ == "__main__":
    main() 