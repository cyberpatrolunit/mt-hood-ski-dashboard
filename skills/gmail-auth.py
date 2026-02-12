#!/usr/bin/env python3
"""
Gmail & Calendar OAuth Authentication
Generates token.json for Gmail and Calendar API access
"""

import os
import sys
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle

# Scopes for Gmail and Calendar
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
]

CREDENTIALS_FILE = '/Users/cpuai/.openclaw/workspace/gmail_credentials.json'
TOKEN_FILE = '/Users/cpuai/.openclaw/workspace/google_token.pickle'

def authenticate():
    """Authenticate and save credentials"""
    creds = None
    
    # Check if token already exists
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    # If no valid credentials, authenticate
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            creds.refresh(Request())
        else:
            print("Starting OAuth flow...")
            print("A browser window will open for authentication.")
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=8080)
        
        # Save credentials
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
        print(f"✅ Token saved to {TOKEN_FILE}")
    else:
        print("✅ Valid credentials found!")
    
    return creds

if __name__ == '__main__':
    try:
        creds = authenticate()
        print("\n✅ Authentication successful!")
        print("Gmail and Calendar API access enabled.")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
