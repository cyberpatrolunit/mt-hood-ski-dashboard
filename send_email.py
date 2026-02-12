#!/usr/bin/env python3
"""Quick Gmail sender"""
import os.path
import pickle
import base64
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def authenticate():
    creds = None
    token_file = 'gmail_token.pickle'
    
    if os.path.exists(token_file):
        with open(token_file, 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'gmail_credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open(token_file, 'wb') as token:
            pickle.dump(creds, token)
    
    return build('gmail', 'v1', credentials=creds)

def send_email(service, to, subject, body):
    message = MIMEText(body)
    message['to'] = to
    message['subject'] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    
    try:
        message = service.users().messages().send(
            userId='me',
            body={'raw': raw}
        ).execute()
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 4:
        print("Usage: send_email.py <to> <subject> <body>")
        sys.exit(1)
    
    service = authenticate()
    success = send_email(service, sys.argv[1], sys.argv[2], sys.argv[3])
    print("✅ Sent!" if success else "❌ Failed")
