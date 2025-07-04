# Push Notifications Setup Guide

This app uses a hybrid approach for notifications:

## Development Mode (Current Setup)
- **Local notifications only** - no external services needed
- Works perfectly for testing notification UI and flow
- No Firebase or external push service required

## Production Mode (Future Setup)

### Option 1: Supabase + Expo Push Notifications (Recommended)
1. **Get Expo Push Tokens** in your app:
   ```typescript
   const token = (await Notifications.getExpoPushTokenAsync()).data;
   ```

2. **Save tokens to Supabase** (already set up in your database)

3. **Create Supabase Edge Function** to send notifications:
   ```typescript
   // supabase/functions/send-notification/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

   serve(async (req) => {
     const { tokens, title, body, data } = await req.json()
     
     const messages = tokens.map(token => ({
       to: token,
       sound: 'default',
       title,
       body,
       data,
     }))

     const response = await fetch('https://exp.host/--/api/v2/push/send', {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Accept-encoding': 'gzip, deflate',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(messages),
     })

     return new Response(JSON.stringify({ success: true }))
   })
   ```

4. **Call Edge Function** when location is shared:
   ```sql
   -- Trigger function when location_shares is inserted
   CREATE OR REPLACE FUNCTION notify_location_share()
   RETURNS TRIGGER AS $$
   BEGIN
     -- Call Supabase Edge Function to send notification
     PERFORM net.http_post(
       url := 'YOUR_SUPABASE_URL/functions/v1/send-notification',
       headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
       body := json_build_object(
         'receiver_id', NEW.receiver_id,
         'sender_id', NEW.sender_id
       )::jsonb
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

### Option 2: Direct FCM (More Complex)
- Set up Firebase Cloud Messaging
- Use Supabase Edge Functions to send via FCM API
- More control but requires Firebase setup

## Current Benefits
✅ **No Firebase dependency** - cleaner codebase  
✅ **No external API keys** needed for development  
✅ **Local notifications work perfectly** for testing  
✅ **Easy to extend** to production push notifications later  
✅ **Supabase-first approach** - everything in one place  

## When to Add Push Notifications
- When you need to notify users who aren't actively using the app
- When you're ready to deploy to production
- When you have multiple users testing the app

The current setup is perfect for development and can easily be extended later!
