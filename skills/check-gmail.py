#!/usr/bin/env python3
"""
Check Gmail for urgent/important messages
"""

import os
import sys
import pickle
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json

TOKEN_FILE = '/Users/cpuai/.openclaw/workspace/google_token.pickle'

def check_urgent_emails(hours_back=24):
    """Check for urgent emails in the last N hours"""
    
    if not os.path.exists(TOKEN_FILE):
        print(json.dumps({
            "error": "Not authenticated. Run: python3 skills/gmail-auth.py"
        }))
        return
    
    try:
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
        
        service = build('gmail', 'v1', credentials=creds)
        
        # Calculate time threshold
        after_time = datetime.now() - timedelta(hours=hours_back)
        after_timestamp = int(after_time.timestamp())
        
        # Search for urgent emails
        urgent_queries = [
            f'is:unread (subject:urgent OR subject:asap OR subject:important OR is:starred) after:{after_timestamp}',
            f'is:unread label:important after:{after_timestamp}'
        ]
        
        urgent_emails = []
        
        for query in urgent_queries:
            try:
                results = service.users().messages().list(
                    userId='me',
                    q=query,
                    maxResults=10
                ).execute()
                
                messages = results.get('messages', [])
                
                for msg in messages:
                    # Get full message details
                    message = service.users().messages().get(
                        userId='me',
                        id=msg['id'],
                        format='metadata',
                        metadataHeaders=['From', 'Subject', 'Date']
                    ).execute()
                    
                    headers = {h['name']: h['value'] for h in message['payload']['headers']}
                    
                    urgent_emails.append({
                        'id': msg['id'],
                        'from': headers.get('From', 'Unknown'),
                        'subject': headers.get('Subject', 'No subject'),
                        'date': headers.get('Date', 'Unknown'),
                        'snippet': message.get('snippet', '')
                    })
            except HttpError:
                pass
        
        # Remove duplicates
        seen = set()
        unique_emails = []
        for email in urgent_emails:
            if email['id'] not in seen:
                seen.add(email['id'])
                unique_emails.append(email)
        
        print(json.dumps({
            'count': len(unique_emails),
            'emails': unique_emails[:5]  # Top 5
        }, indent=2))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))

if __name__ == '__main__':
    hours = int(sys.argv[1]) if len(sys.argv) > 1 else 24
    check_urgent_emails(hours)
