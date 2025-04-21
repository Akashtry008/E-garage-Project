import os
import sys
import time
import logging
import argparse
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def send_to_yopmail_inbox(username, subject, html_content):
    """
    Uses Selenium to automate placing an email directly in a Yopmail inbox.
    
    Args:
        username: The yopmail username (without @yopmail.com)
        subject: Email subject
        html_content: The HTML content of the email
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # First check if Selenium is installed
        try:
            from selenium import webdriver
            from selenium.webdriver.common.by import By
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
        except ImportError:
            logger.error("Selenium is not installed. Please install with: pip install selenium")
            print("\n❌ Selenium is not installed. Run: pip install selenium")
            return False
            
        logger.info(f"Starting Yopmail automation for username: {username}")
        
        # Setup Chrome options for the webdriver
        chrome_options = Options()
        
        # Uncomment this for headless mode (no visible browser)
        # chrome_options.add_argument("--headless")
        
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-extensions")
        
        # Create the WebDriver
        logger.info("Initializing Chrome WebDriver...")
        driver = webdriver.Chrome(options=chrome_options)
        
        try:
            # Navigate to Yopmail
            driver.get(f"https://yopmail.com/en/")
            logger.info("Navigated to Yopmail.com")
            
            # Wait for the page to load
            time.sleep(2)
            
            # Enter the email address
            try:
                logger.info(f"Entering email: {username}@yopmail.com")
                login_input = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, "login"))
                )
                login_input.clear()
                login_input.send_keys(username)
                
                # Click the login button
                submit_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button.f.bl"))
                )
                submit_button.click()
                logger.info("Clicked login button")
                
                # Wait for the inbox to load
                time.sleep(3)
                
                # Look for the "Write a mail" button in the toolbar
                toolbar = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, "toolbar"))
                )
                
                # Find the "Write" button
                write_button = WebDriverWait(toolbar, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button.wm"))
                )
                write_button.click()
                logger.info("Clicked 'Write mail' button")
                
                # Wait for the compose frame to load
                time.sleep(2)
                
                # Switch to the mail iframe
                driver.switch_to.frame(driver.find_element(By.ID, "ifmail"))
                
                # Fill in the destination email
                to_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, "msgto"))
                )
                to_field.clear()
                to_field.send_keys(f"{username}@yopmail.com")
                
                # Fill in the subject
                subject_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, "msgsubject"))
                )
                subject_field.clear()
                subject_field.send_keys(subject)
                
                # Fill in the message body
                time.sleep(1)
                try:
                    # Try using iframe editor if available
                    body_frame = driver.find_element(By.CSS_SELECTOR, ".cke_wysiwyg_frame")
                    driver.switch_to.frame(body_frame)
                    body_element = driver.find_element(By.TAG_NAME, "body")
                    driver.execute_script(f'arguments[0].innerHTML = `{html_content}`;', body_element)
                    driver.switch_to.default_content()
                    driver.switch_to.frame(driver.find_element(By.ID, "ifmail"))
                except Exception as e:
                    logger.warning(f"Could not use iframe editor: {str(e)}")
                    # Alternative: try direct textarea if iframe editor isn't available
                    body_field = driver.find_element(By.ID, "msgbody")
                    body_field.clear()
                    body_field.send_keys(html_content)
                
                # Click send button
                send_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "msgsend"))
                )
                send_button.click()
                logger.info("Clicked send button")
                
                # Wait for confirmation
                time.sleep(3)
                
                # Check inbox to verify the email appears
                driver.switch_to.default_content()
                refresh_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "refresh"))
                )
                refresh_button.click()
                logger.info("Refreshed inbox")
                
                # Wait for inbox to refresh
                time.sleep(3)
                
                # Success!
                logger.info(f"Successfully placed email in {username}@yopmail.com inbox")
                print(f"\n✅ Email successfully added to {username}@yopmail.com inbox!")
                print(f"View the inbox at: https://yopmail.com/en/?login={username}")
                
                return True
                
            except Exception as e:
                logger.error(f"Error during Yopmail automation: {str(e)}")
                print(f"\n❌ Error: {str(e)}")
                return False
                
        finally:
            # Close the browser
            driver.quit()
            logger.info("WebDriver closed")
            
    except Exception as e:
        logger.error(f"Automation error: {str(e)}")
        print(f"\n❌ Automation error: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Send an email directly to a Yopmail inbox')
    parser.add_argument('username', help='Yopmail username (without @yopmail.com)')
    parser.add_argument('-s', '--subject', default='E-Garage Test Email', help='Email subject')
    parser.add_argument('-f', '--file', help='HTML file to use as email content')
    parser.add_argument('--html', help='Direct HTML content for the email')
    
    args = parser.parse_args()
    
    # Determine the HTML content
    html_content = None
    
    if args.html:
        html_content = args.html
    elif args.file:
        try:
            with open(args.file, 'r') as f:
                html_content = f.read()
        except Exception as e:
            print(f"Error reading HTML file: {str(e)}")
            sys.exit(1)
    else:
        # Default HTML content
        html_content = f"""
        <html>
        <body>
            <h1>E-Garage Email Test</h1>
            <p>This is a test email from E-Garage application.</p>
            <p>If you're seeing this, the email configuration is working correctly!</p>
            <p>Time sent: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
            <hr>
            <p><small>This email was placed directly in your Yopmail inbox.</small></p>
        </body>
        </html>
        """
    
    # Send the email
    success = send_to_yopmail_inbox(args.username, args.subject, html_content)
    
    if not success:
        # Save the email to a file as a backup
        emails_dir = Path("emails")
        emails_dir.mkdir(exist_ok=True)
        
        timestamp = time.strftime('%Y%m%d%H%M%S')
        filename = emails_dir / f"failed_yopmail_direct_{timestamp}.html"
        
        with open(filename, 'w') as f:
            f.write(f"To: {args.username}@yopmail.com\n")
            f.write(f"Subject: {args.subject}\n\n")
            f.write(html_content)
        
        logger.info(f"Failed email content saved to {filename}")
        print(f"Email content saved to {filename}")
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 