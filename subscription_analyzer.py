#!/usr/bin/env python3
"""
Subscription Analyzer with Data Visualization
Categorizes subscriptions as monthly vs yearly and shows spending breakdown
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
from datetime import datetime

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def authenticate():
    """Handles OAuth authentication"""
    creds = None
    if os.path.exists('gmail_token.pickle'):
        with open('gmail_token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'gmail_credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('gmail_token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
    return build('gmail', 'v1', credentials=creds)

def search_subscription_emails(service):
    """Search for recurring subscription emails"""
    queries = [
        'subject:"monthly subscription" OR subject:"annual subscription"',
        'subject:"subscription renewal"',
        'subject:"your subscription"',
        'from:(billing@anthropic OR noreply@apple OR billing@spline)',
        'subject:"your plan" OR subject:"membership"',
        '"recurring charge" OR "auto-renewal" OR "subscription fee"'
    ]
    
    all_messages = []
    seen_ids = set()
    
    print("🔍 Searching for subscription emails...")
    
    for query in queries:
        try:
            results = service.users().messages().list(
                userId='me',
                q=query,
                maxResults=200
            ).execute()
            
            messages = results.get('messages', [])
            for msg in messages:
                if msg['id'] not in seen_ids:
                    all_messages.append(msg)
                    seen_ids.add(msg['id'])
        except Exception as e:
            pass
    
    return all_messages

def extract_email_details(service, message_id):
    """Extract subscription details from email"""
    try:
        msg = service.users().messages().get(
            userId='me', 
            id=message_id,
            format='full'
        ).execute()
        
        headers = msg['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), '')
        sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
        date_str = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')
        
        # Get email body
        body = ''
        if 'parts' in msg['payload']:
            for part in msg['payload']['parts']:
                if part['mimeType'] == 'text/plain' and 'data' in part['body']:
                    body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                    break
        elif 'body' in msg['payload'] and 'data' in msg['payload']['body']:
            body = base64.urlsafe_b64decode(msg['payload']['body']['data']).decode('utf-8', errors='ignore')
        
        text = subject + ' ' + body
        
        # Extract company name
        company = ''
        if 'anthropic' in sender.lower():
            company = 'Anthropic Claude'
        elif 'apple' in sender.lower():
            company = 'Apple'
        elif 'spline' in sender.lower():
            company = 'Spline'
        elif 'autodesk' in sender.lower():
            company = 'Autodesk'
        elif 'polycam' in sender.lower():
            company = 'Polycam'
        else:
            # Extract from sender
            if '<' in sender:
                company = sender.split('<')[0].strip().strip('"')
            else:
                company = sender.split('@')[-1].split('.')[0] if '@' in sender else sender
        
        # Extract amount
        amounts = re.findall(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)', text)
        amount = None
        if amounts:
            # Get the first non-zero amount
            for amt in amounts:
                val = float(amt.replace(',', ''))
                if val > 0:
                    amount = val
                    break
        
        # Detect frequency
        frequency = None
        text_lower = text.lower()
        if 'monthly' in text_lower or 'per month' in text_lower or '/month' in text_lower:
            frequency = 'monthly'
        elif 'annual' in text_lower or 'yearly' in text_lower or 'per year' in text_lower or '/year' in text_lower:
            frequency = 'yearly'
        
        return {
            'company': company[:40],
            'amount': amount,
            'frequency': frequency,
            'subject': subject[:80],
            'sender': sender[:60],
            'date': date_str[:30]
        }
    except Exception as e:
        return None

def categorize_subscriptions(subscriptions):
    """Group subscriptions by company and frequency"""
    monthly = {}
    yearly = {}
    unknown = {}
    
    for sub in subscriptions:
        if not sub['amount']:
            continue
        
        company = sub['company']
        
        if sub['frequency'] == 'monthly':
            if company not in monthly or monthly[company] < sub['amount']:
                monthly[company] = sub['amount']
        elif sub['frequency'] == 'yearly':
            if company not in yearly or yearly[company] < sub['amount']:
                yearly[company] = sub['amount']
        else:
            if company not in unknown or unknown[company] < sub['amount']:
                unknown[company] = sub['amount']
    
    return monthly, yearly, unknown

def print_bar_chart(label, value, max_value, width=40):
    """Print a simple text bar chart"""
    if max_value == 0:
        bar_width = 0
    else:
        bar_width = int((value / max_value) * width)
    bar = '█' * bar_width
    return f"{label:30} {bar:40} ${value:,.2f}"

def main():
    print("\n" + "="*70)
    print("  💰 SUBSCRIPTION ANALYZER")
    print("="*70 + "\n")
    
    service = authenticate()
    
    messages = search_subscription_emails(service)
    print(f"📧 Found {len(messages)} potential subscription emails\n")
    
    if not messages:
        print("❌ No subscription emails found!")
        return
    
    print("📊 Analyzing subscriptions...\n")
    subscriptions = []
    for i, msg in enumerate(messages[:150], 1):
        if i % 20 == 0:
            print(f"   Processed {i}/{min(150, len(messages))} emails...")
        details = extract_email_details(service, msg['id'])
        if details and details['amount']:
            subscriptions.append(details)
    
    monthly, yearly, unknown = categorize_subscriptions(subscriptions)
    
    # Calculate totals
    monthly_total = sum(monthly.values())
    yearly_total = sum(yearly.values())
    monthly_equiv_yearly = monthly_total * 12
    total_annual_cost = monthly_equiv_yearly + yearly_total
    
    # Print results
    print("\n" + "="*70)
    print("  📅 MONTHLY SUBSCRIPTIONS")
    print("="*70 + "\n")
    
    if monthly:
        max_monthly = max(monthly.values())
        for company, amount in sorted(monthly.items(), key=lambda x: x[1], reverse=True):
            print(print_bar_chart(company, amount, max_monthly))
        print("\n" + "-"*70)
        print(f"{'MONTHLY TOTAL:':30} {'':40} ${monthly_total:,.2f}/month")
        print(f"{'(Annual equivalent:)':30} {'':40} ${monthly_equiv_yearly:,.2f}/year")
    else:
        print("   No monthly subscriptions found")
    
    print("\n" + "="*70)
    print("  📆 YEARLY SUBSCRIPTIONS")
    print("="*70 + "\n")
    
    if yearly:
        max_yearly = max(yearly.values())
        for company, amount in sorted(yearly.items(), key=lambda x: x[1], reverse=True):
            print(print_bar_chart(company, amount, max_yearly))
        print("\n" + "-"*70)
        print(f"{'YEARLY TOTAL:':30} {'':40} ${yearly_total:,.2f}/year")
    else:
        print("   No yearly subscriptions found")
    
    if unknown:
        print("\n" + "="*70)
        print("  ❓ UNKNOWN FREQUENCY")
        print("="*70 + "\n")
        for company, amount in sorted(unknown.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"  • {company}: ${amount:,.2f}")
    
    # Summary
    print("\n" + "="*70)
    print("  💵 TOTAL ANNUAL SPENDING")
    print("="*70 + "\n")
    
    print(f"  Monthly subscriptions (×12):    ${monthly_equiv_yearly:>12,.2f}")
    print(f"  Yearly subscriptions:           ${yearly_total:>12,.2f}")
    print("  " + "-"*48)
    print(f"  TOTAL ANNUAL COST:              ${total_annual_cost:>12,.2f}")
    print(f"\n  Average monthly equivalent:     ${total_annual_cost/12:>12,.2f}/month\n")
    
    # Breakdown pie chart (text version)
    if monthly_equiv_yearly > 0 or yearly_total > 0:
        monthly_pct = (monthly_equiv_yearly / total_annual_cost) * 100 if total_annual_cost > 0 else 0
        yearly_pct = (yearly_total / total_annual_cost) * 100 if total_annual_cost > 0 else 0
        
        print("="*70)
        print("  📊 SPENDING BREAKDOWN")
        print("="*70 + "\n")
        print(f"  Monthly subscriptions: {monthly_pct:>5.1f}% {'█' * int(monthly_pct/2)}")
        print(f"  Yearly subscriptions:  {yearly_pct:>5.1f}% {'█' * int(yearly_pct/2)}")
    
    print("\n" + "="*70 + "\n")

if __name__ == '__main__':
    main()
