import smtplib
import ssl
import secrets
from email.message import EmailMessage
from app.core.config import settings
from app.utils.logger import logger
def generate_otp() -> str:
    """
Generate a secure 6-digit OTP."""
    return str(secrets.randbelow(900000) + 100000)
def send_otp_email(
    recipient_email: str,
    otp: str
) -> None:
    """Send OTP to the user's email."""
    # Create a new email message
    message = EmailMessage()
    # Email subject
    message["Subject"] = "Smart Medicine System - Email Verification OTP"
    # Sender email
    message["From"] = settings.SMTP_FROM
    # Receiver email
    message["To"] = recipient_email
    # Email body
    message.set_content(
        f"""
    Hello,

    Welcome to Smart Medicine Availability & Intelligent Janaushadhi Recommendation System.

    Your One-Time Password (OTP) for email verification is:

    {otp}

    This OTP is valid for 10 minutes.

    Please do not share this OTP with anyone.

    If you did not create this account, you can safely ignore this email.

    Thank you,
    Smart Medicine System Team
    """
    )
    try:
        # Connect to Gmail SMTP server
        with smtplib.SMTP(
            settings.SMTP_SERVER,
            settings.SMTP_PORT
        ) as server:
        # Enable encrypted communication
            server.starttls()
        # Login using Gmail App Password
            server.login(
                settings.SMTP_EMAIL,
                settings.SMTP_PASSWORD
            )
        # Send the email
            server.send_message(message)

            logger.info(
                f"OTP email sent successfully to {recipient_email}"
            )
    except Exception as e:
        logger.error(
            f"Failed to send OTP email: {str(e)}"
        )
        raise