# Quick Fix: Legacy Places API Error

If you're seeing this error:
```
You're calling a legacy API, which is not enabled for your project.
LegacyApiNotActivatedMapError
```

## ⚡ Quick Fix Applied

**The component has been updated to remove `version: "weekly"`** which was causing Google to route through the new platform requiring Places API (New). The default version now uses the legacy Places API.

**If you still see the error after this fix, follow the steps below:**

## Step-by-Step Fix

### Step 1: Enable the Legacy Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Library**
4. In the search bar, type: **"Places API"**
5. You'll see two options:
   - **Places API** ← **Enable this one** (the legacy version)
   - **Places API (New)** ← Different API, can be enabled separately
6. Click on **"Places API"** (the first one, without "New")
7. Click the **"Enable"** button
8. Wait for it to enable (usually takes a few seconds)

### Step 2: Add Places API to Your API Key Restrictions

1. Still in Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Click on your API key
3. Scroll down to **"API restrictions"**
4. Make sure **"Restrict key"** is selected
5. Under **"Select APIs"**, look for **"Places API"** in the list
6. If it's not checked, check the box next to **"Places API"**
7. Click **"Save"** at the bottom

### Step 3: Verify All Required APIs Are Enabled

Make sure these APIs are enabled in **APIs & Services** → **Library**:
- ✅ **Maps JavaScript API**
- ✅ **Places API** (legacy - this is the one causing the error)
- ✅ **Geocoding API**

### Step 4: Wait and Restart

1. **Wait 5-10 minutes** for Google's systems to propagate the changes
2. **Restart your Next.js dev server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
3. **Clear your browser cache** or use an incognito/private window
4. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)

### Step 5: Verify It's Working

1. Open your browser's Developer Console (F12)
2. Go to the Console tab
3. Look for any Google Maps errors
4. If you still see the error, wait another 5 minutes and try again

## Why This Happens

- Google has **two different Places APIs**:
  - **Places API** (legacy) - Used by the Autocomplete widget
  - **Places API (New)** - Newer REST API, different use case
- The Autocomplete widget in Maps JavaScript API requires the **legacy Places API**
- Both APIs can be enabled simultaneously - they don't conflict

## Still Not Working?

1. **Check API Key Restrictions:**
   - Make sure your API key allows "Places API" (not just "Places API (New)")
   - Check that HTTP referrer restrictions include `localhost:3000/*`

2. **Verify Billing:**
   - Go to **Billing** in Google Cloud Console
   - Make sure billing is enabled (required even for free tier)

3. **Check Browser Console:**
   - Open DevTools (F12) → Console tab
   - Look for specific error messages
   - Share the exact error message if it's different

4. **Double-check Environment Variable:**
   - Make sure `.env.local` has: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key`
   - Restart the dev server after changing `.env.local`

## Visual Guide

When searching for "Places API" in the API Library, you should see:

```
┌─────────────────────────────────────┐
│ Places API                          │ ← Enable THIS one
│ Places API (New)                    │ ← Different API
└─────────────────────────────────────┘
```

Both can be enabled, but the Autocomplete widget needs the first one.
