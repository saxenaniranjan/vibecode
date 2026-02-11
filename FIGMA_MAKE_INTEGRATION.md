# Figma Make Integration Guide

This document explains how to integrate the typewriter journal with Figma Make for database and backend functionality.

## API Endpoints

### 1. Webhook Endpoint (Receive from Figma Make)
**URL:** `https://your-domain.vercel.app/api/webhook`  
**Method:** POST  
**Purpose:** Receive webhooks from Figma Make workflows

**Example Payload:**
```json
{
  "action": "save_entry",
  "data": {
    "text": "Today we...",
    "author": "person1",
    "timestamp": "2026-02-09T18:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook received",
  "timestamp": "2026-02-09T18:00:00Z"
}
```

### 2. Journal API (Send to Figma Make)
**URL:** `https://your-domain.vercel.app/api/journal`  
**Method:** POST  
**Purpose:** Save journal entries (can trigger Figma Make webhook)

**Example Request:**
```json
{
  "text": "Today we went for a walk...",
  "author": "person1",
  "timestamp": "2026-02-09T18:00:00Z"
}
```

## Figma Make Setup

### Step 1: Create Webhook Module
1. In Figma Make, add a **Webhook** module
2. Set the URL to: `https://your-domain.vercel.app/api/webhook`
3. Choose **POST** method
4. Configure authentication if needed (add API key in headers)

### Step 2: Database Integration
1. Add a **Database** module (e.g., Airtable, Google Sheets, or custom database)
2. Map webhook data to database fields:
   - `text` → Journal Entry
   - `author` → Author Name
   - `timestamp` → Date/Time

### Step 3: Real-time Sync (Optional)
1. Add a **Webhook** trigger module
2. Set up to send updates back to your app when entries change
3. Use WebSocket or polling in your frontend

## Frontend Integration

To save entries from the typewriter:

```typescript
// Example: Save entry when user finishes typing
const saveEntry = async (text: string) => {
  const response = await fetch('/api/journal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      author: 'person1', // or get from auth
      timestamp: new Date().toISOString()
    })
  });
  return response.json();
};
```

## Environment Variables

Add to `.env.local`:
```
FIGMA_MAKE_WEBHOOK_URL=https://hook.us1.make.com/your-webhook-id
FIGMA_MAKE_API_KEY=your-api-key-if-needed
```

## Next Steps

1. **Database Setup:** Choose your database (Airtable, Supabase, MongoDB, etc.)
2. **Authentication:** Add user auth (for 2-person journal)
3. **Real-time Updates:** Implement WebSocket or polling for live sync
4. **Figma Make Workflow:** Build automation in Figma Make

---

**Current Status:** API endpoints are ready. Database integration pending.
