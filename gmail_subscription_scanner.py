#!/usr/bin/env python3
"""
Gmail Subscription Scanner
Finds all your subscription emails and extracts payment info
"""

import os.path
import pickle
import re
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from collections import defaultdict
import base64

# Gmail API scopes - we only need read access
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def authenticate():
    """Handles OAuth authentication and returns Gmail service"""
    creds = None
    token_file = 'gmail_token.pickle'
    
    # Load saved token if exists
    if os.path.exists(token_file):
        with open(token_file, 'rb') as token:
            creds = pickle.load(token)
    
    # If no valid credentials, do OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            creds.refresh(Request())
        else:
            print("\n🔐 Opening browser for Gmail authorization...")
            print("Please authorize access to your Gmail (read-only)\n")
            flow = InstalledAppFlow.from_client_secrets_file(
                'gmail_credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the token for next time
        with open(token_file, 'wb') as token:
            pickle.dump(creds, token)
        print("✅ Authentication successful!\n")
    
    return build('gmail', 'v1', credentials=creds)

def search_subscription_emails(service, max_results=500):
    """Search for subscription-related emails"""
    queries = [
        'subject:(subscription OR billing OR payment OR invoice OR receipt)',
        'from:(noreply OR billing OR subscriptions OR payments)',
        'subject:"your subscription"',
        'subject:"monthly payment"',
        'subject:"your bill"'
    ]
    
    all_messages = []
    seen_ids = set()
    
    print("🔍 Scanning your Gmail for subscription emails...")
    
    for query in queries:
        try:
            results = service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            for msg in messages:
                if msg['id'] not in seen_ids:
                    all_messages.append(msg)
                    seen_ids.add(msg['id'])
        except Exception as e:
            print(f"Error searching: {e}")
    
    print(f"📧 Found {len(all_messages)} subscription-related emails\n")
    return all_messages[:max_results]

def extract_subscription_info(service, message_id):
    """Extract subscription details from an email"""
    try:
        msg = service.users().messages().get(
            userId='me', 
            id=message_id,
            format='full'
        ).execute()
        
        headers = msg['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), '')
        sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
        date = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')
        
        # Get email body
        body = ''
        if 'parts' in msg['payload']:
            for part in msg['payload']['parts']:
                if part['mimeType'] == 'text/plain' and 'data' in part['body']:
                    body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                    break
        elif 'body' in msg['payload'] and 'data' in msg['payload']['body']:
            body = base64.urlsafe_b64decode(msg['payload']['body']['data']).decode('utf-8', errors='ignore')
        
        # Extract amounts (look for $X.XX or $X,XXX.XX patterns)
        amounts = re.findall(r'\$\d+(?:,\d{3})*(?:\.\d{2})?', subject + ' ' + body)
        
        # Extract company name from sender
        company = sender.split('@')[-1].split('.')[0] if '@' in sender else sender
        company = re.sub(r'[<>"]', '', company).strip()
        
        return {
            'company': company,
            'subject': subject[:100],
            'sender': sender[:50],
            'date': date[:30],
            'amounts': list(set(amounts))[:3]  # Get unique amounts
        }
    except Exception as e:
        return None

def main():
    print("\n" + "="*60)
    print("  📬 Gmail Subscription Scanner")
    print("="*60 + "\n")
    
    # Authenticate
    service = authenticate()
    
    # Search for subscription emails
    messages = search_subscription_emails(service)
    
    if not messages:
        print("❌ No subscription emails found!")
        return
    
    # Extract info from messages
    print("📊 Analyzing subscription emails...\n")
    subscriptions = defaultdict(list)
    
    for i, msg in enumerate(messages[:100], 1):  # Process first 100
        if i % 10 == 0:
            print(f"   Processed {i}/{min(100, len(messages))} emails...")
        
        info = extract_subscription_info(service, msg['id'])
        if info and info['amounts']:
            subscriptions[info['company']].append(info)
    
    # Display results
    print("\n" + "="*60)
    print("  💳 SUBSCRIPTION SUMMARY")
    print("="*60 + "\n")
    
    for company, emails in sorted(subscriptions.items()):
        amounts = []
        for email in emails:
            amounts.extend(email['amounts'])
        
        if amounts:
            print(f"📌 {company.upper()}")
            unique_amounts = list(set(amounts))[:3]
            print(f"   Amount(s): {', '.join(unique_amounts)}")
            print(f"   Last email: {emails[0]['subject'][:60]}...")
            print(f"   From: {emails[0]['sender'][:50]}")
            print()
    
    print("="*60)
    print(f"\n✅ Found {len(subscriptions)} companies with billing emails")
    print("\nNote: This searches your Purchases folder and subscription emails.")
    print("Some subscriptions might not appear if they use different wording.\n")

if __name__ == '__main__':
    main()
