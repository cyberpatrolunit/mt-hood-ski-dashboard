#!/usr/bin/env python3
"""
Check Google Calendar for upcoming events
"""

import os
import sys
import pickle
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json

TOKEN_FILE = '/Users/cpuai/.openclaw/workspace/google_token.pickle'

def check_upcoming_events(hours_ahead=48):
    """Check for events in the next N hours"""
    
    if not os.path.exists(TOKEN_FILE):
        print(json.dumps({
            "error": "Not authenticated. Run: python3 skills/gmail-auth.py"
        }))
        return
    
    try:
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
        
        service = build('calendar', 'v3', credentials=creds)
        
        # Get events from now to hours_ahead
        now = datetime.utcnow()
        time_max = now + timedelta(hours=hours_ahead)
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=now.isoformat() + 'Z',
            timeMax=time_max.isoformat() + 'Z',
            maxResults=20,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        upcoming = []
        urgent = []  # Events <2 hours away
        
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            
            # Parse start time
            if 'T' in start:
                start_dt = datetime.fromisoformat(start.replace('Z', '+00:00'))
            else:
                # All-day event
                continue
            
            hours_until = (start_dt - now.replace(tzinfo=None)).total_seconds() / 3600
            
            event_info = {
                'summary': event.get('summary', 'No title'),
                'start': start,
                'hours_until': round(hours_until, 1),
                'location': event.get('location', ''),
                'description': event.get('description', '')[:100]
            }
            
            upcoming.append(event_info)
            
            if hours_until < 2:
                urgent.append(event_info)
        
        print(json.dumps({
            'total_count': len(upcoming),
            'urgent_count': len(urgent),
            'urgent_events': urgent,
            'upcoming_events': upcoming[:10]
        }, indent=2))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))

if __name__ == '__main__':
    hours = int(sys.argv[1]) if len(sys.argv) > 1 else 48
    check_upcoming_events(hours)
