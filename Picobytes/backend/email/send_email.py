# Import smtplib for the actual sending function
import smtplib


def send (subject : str, message : str, recipient : str):
    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login("picobytes.notifications", "booe kcws azsq snep ")

    text = f"Subject: {subject}\n\n{message}"

    s.sendmail("PicoBytes.Notifications@gmail.com", recipient, text)

    s.quit()
