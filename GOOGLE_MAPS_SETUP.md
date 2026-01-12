# Google Maps Location Picker Setup

This guide explains how to set up the Google Maps location picker feature for member addresses.

## Prerequisites

1. A Google Cloud Platform account
2. A project with Google Maps JavaScript API and Places API enabled

## Installation Steps

### 1. Install Required Packages

```bash
npm install @react-google-maps/api @types/google.maps
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. **Enable Billing** (Required - even for free tier usage)
4. Enable the following APIs in **APIs & Services > Library**:
   - **Maps JavaScript API** (Required)
   - **Places API** (Required - This is the LEGACY Places API, search for "Places API" not "Places API (New)")
   - **Geocoding API** (Required - for reverse geocoding)
   
   **Important:** You need to enable BOTH:
   - The legacy **Places API** (for Autocomplete widget)
   - You may also see "Places API (New)" - this is different and optional for our use case
   
   **If you see "LegacyApiNotActivatedMapError":**
   - Search for "Places API" in the API Library
   - Look for the one that says "Places API" (without "New")
   - Enable it even if you already have "Places API (New)" enabled
   - The Autocomplete widget requires the legacy Places API
5. Go to **APIs & Services > Credentials** and create an API key
6. (Recommended) Restrict the API key to your domain for security:
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:3000/*` for development, `yourdomain.com/*` for production)
   - Under "API restrictions", select "Restrict key" and choose:
     - Maps JavaScript API
     - Places API
     - Geocoding API

### 3. Add Environment Variable

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important:** The variable name must start with `NEXT_PUBLIC_` to be accessible in the browser.

### 4. Run Database Migration

The schema has been updated to include location fields. Run the migration:

```bash
npx prisma migrate dev --name add_member_location_fields
```

Or if you prefer to push without creating a migration:

```bash
npx prisma db push
```

Then regenerate the Prisma client:

```bash
npx prisma generate
```

## Features

The location picker includes:

- **Google Places Autocomplete**: Type an address and select from suggestions
- **Interactive Map**: Click on the map to pin a location
- **Draggable Marker**: Drag the marker to adjust the location
- **Reverse Geocoding**: Automatically extracts city, state, and pincode from coordinates
- **Optional Field**: Location is completely optional - members can be created without it

## Usage

1. When creating or editing a member, scroll to the "Location (Optional)" section
2. Start typing an address in the search box
3. Select an address from the autocomplete suggestions
4. The map will appear showing the selected location
5. You can click on the map or drag the marker to adjust the location
6. The address, city, state, and pincode will be automatically populated

## API Costs

Google Maps APIs have usage-based pricing. For development, you can use the free tier which includes:
- $200 free credit per month
- This typically covers moderate usage for development and small applications

Monitor your usage in the Google Cloud Console to avoid unexpected charges.

## Security Notes

1. **Restrict API Key**: In Google Cloud Console, restrict your API key to:
   - HTTP referrers (your domain)
   - Specific APIs (Maps JavaScript API, Places API, Geocoding API)
   
2. **Never commit API keys**: Make sure `.env.local` is in your `.gitignore`

3. **Use environment variables**: Never hardcode API keys in your source code

## Troubleshooting

### "This page can't load Google Maps correctly" or "Legacy API not enabled"

**This is the most common error. Follow these steps:**

1. **Enable Billing** (Critical!)
   - Go to Google Cloud Console > Billing
   - Link a billing account to your project
   - Even the free tier requires billing to be enabled

2. **Enable the Correct APIs**
   - Go to APIs & Services > Library
   - Search for and enable:
     - **Maps JavaScript API** (not "Maps SDK for JavaScript")
     - **Places API** (the standard one, NOT "Places API (New)")
     - **Geocoding API**
   - Wait a few minutes after enabling for changes to propagate

3. **Check API Key Configuration**
   - Go to APIs & Services > Credentials
   - Click on your API key
   - Under "API restrictions", make sure these APIs are selected:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   - Under "Application restrictions", if set to HTTP referrers, ensure:
     - `localhost:3000/*` is added for development
     - Your production domain is added for production

4. **Verify Environment Variable**
   - Make sure `.env.local` has: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`
   - Restart your Next.js dev server after adding/changing the variable
   - The variable name MUST start with `NEXT_PUBLIC_`

5. **Check Browser Console**
   - Open browser DevTools (F12)
   - Look for specific error messages like:
     - `ApiNotActivatedMapError` - API not enabled
     - `BillingNotEnabledMapError` - Billing not enabled
     - `InvalidKeyMapError` - Wrong API key
     - `RefererNotAllowedMapError` - Domain restriction issue

### "You're calling a legacy API" or "LegacyApiNotActivatedMapError"

**This error occurs when using `version: "weekly"` which routes to Google's new platform.**

**Quick Fix:**
- The component has been updated to use the default/stable version instead of "weekly"
- The default version supports the legacy Places API that Autocomplete requires
- If you see this error, make sure you're not using `version: "weekly"` in the code

**If you still see this error:**

1. **Enable the Legacy Places API** (This is different from Places API New)
   - Go to Google Cloud Console > APIs & Services > Library
   - Search for "Places API" (without "New")
   - You should see two options:
     - **Places API** (Legacy) - This is what you need
     - **Places API (New)** - This is different, optional for our use case
   - Click on "Places API" (the legacy one) and click "Enable"
   - Wait 5-10 minutes for the API to be fully activated

2. **Verify API Restrictions**
   - Go to APIs & Services > Credentials
   - Click on your API key
   - Under "API restrictions", make sure "Places API" is listed (not just "Places API (New)")
   - If it's not there, add it:
     - Click "Restrict key"
     - Under "Select APIs", search for and select "Places API"
     - Save the changes

3. **Wait and Restart**
   - Wait 5-10 minutes after enabling
   - Restart your Next.js dev server
   - Clear browser cache or use incognito mode

**Why this happens:**
- Google has both "Places API" (legacy) and "Places API (New)"
- The Autocomplete widget from Maps JavaScript API uses the legacy Places API
- Both APIs can be enabled simultaneously - they serve different purposes

### Autocomplete not showing suggestions
- Ensure Places API is enabled (not just Places API New)
- Check that your API key has Places API access
- Verify billing is enabled
- Check browser console for specific errors

### Map not displaying
- Verify Maps JavaScript API is enabled
- Check browser console for errors
- Ensure the API key is not restricted to a different domain
- Make sure billing is enabled
