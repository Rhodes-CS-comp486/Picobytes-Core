from email_notifications.send_email import send
import datetime

def reminder(name : str, n : int, mail : str): 
    d = datetime.datetime.now()

    formatted_date = d.strftime("(%B %d, %Y)")

    subject = f"Come back to Pico Bytes {formatted_date}"

    message = f"{name}, \n\nYou haven't been on Pico Bytes for {n} days.\nCome back!\n\nhttp://localhost:5173"

    unsubscribe = f"\n\nunsubscribe: http://localhost:5173/unsubscribe/{mail} "

    send(subject, message + unsubscribe, [mail])