import os
import sys

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)

sys.path.append(parent)

from email_notifications.reminder_email import reminder
from email_notifications.streak_email import streak

from services.user_funcs import UserFuncs
from services.streak import Streaks
import re

user_service = UserFuncs()
streak_service = Streaks()


def handle_emails():
    try:
        #returns a list of (uid, user_name)
        users = user_service.get_users()
        
        for user in users:
            [uid, name, email] = user
            streak = streak_service.get_streak(uid)[0]
            days = streak_service.get_days_since_last_login(uid)

            if (days > 1):
                print(f"Sending reminder email to {name} ({email})")
                reminder(name, days, email)
            elif (days == 1):
                print(f"Sedning streak email to {name} ({email})")
                streak(name, streak, email)
            else:
                print(f"No email sent for {name} ({email}), with streak of {streak}, and last login {days} days ago")

            # print(f"{email[1]}: ({days} days, streak of {streak})")
    except Exception as e:
        print(f"Error sending out emails: {e}")
