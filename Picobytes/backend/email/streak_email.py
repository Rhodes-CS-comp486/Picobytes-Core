from send_email import send
import datetime

def streak(name : str, n : int, mail : str, )
    d = datetime.datetime.now()

    formatted_date = d.strftime("(%B %d, %Y)")

    subject = f"Your Pico Bytes streak will expire in 4 hours {formatted_date}"

    message = f"{name}, \n You have 4 hours before your {n} days Pico Bytes streak expires. \nAnswer a question to keep it going! \nhttp://localhost:5173"

    unsubscribe = f"\n\nunsubscribe: http://localhost:5173/unsubscribe/{mail} "

    send(subject, message + unsubscribe, [mail])