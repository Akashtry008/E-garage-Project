#!/bin/bash

echo "==================================================="
echo "              E-GARAGE EMAIL TEST TOOL              "
echo "==================================================="
echo
echo "This tool will test your email configuration by sending a test email."
echo "Make sure you have correctly set up your .env file with proper SMTP settings."
echo

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Ask for recipient email
echo "Please enter the recipient email address (where to send the test email):"
read -p "> " recipient_email

echo
echo "Sending test email to $recipient_email..."
echo "(Check the console output for errors if the email is not received)"
echo

# Run the test email script
python3 test_email.py "$recipient_email"

echo
echo "If the test was successful, check your inbox and spam folder."
echo "If you're having issues, please check your .env file and ensure your email/password are correct."
echo
read -p "Press Enter to continue..." 