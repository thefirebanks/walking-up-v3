# Google Maps API Key Setup (5 Minutes)

## Why Use Google Maps?
- ✅ **Free**: $200/month credit = 28,500+ map loads
- ✅ **Keep your code**: No changes needed
- ✅ **Best performance**: Native integration
- ✅ **Most features**: Street view, satellite, traffic, etc.

## Setup Steps

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Create/Select Project
- Click "Select a project" → "New Project"
- Name: "Walking Up V3" 
- Click "Create"

### 3. Enable Maps SDK
- Go to "APIs & Services" → "Library"
- Search "Maps SDK for Android"
- Click it → Click "Enable"

### 4. Create API Key
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "API Key"
- Copy the API key (looks like: `AIzaSyB...`)

### 5. Restrict the API Key (Important for Security)
- Click on your new API key
- Under "Application restrictions":
  - Select "Android apps"
  - Click "Add an item"
  - Package name: `com.dafirebanks.walkingupv3`
  - SHA-1: Leave blank for development
- Under "API restrictions":
  - Select "Restrict key"
  - Check "Maps SDK for Android"
- Click "Save"

### 6. Add to Your App
Add this line to `/android/app/src/main/AndroidManifest.xml` inside the `<application>` tag:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY_HERE" />
```

### 7. Rebuild
```bash
cd /Users/dafirebanks/Projects/walking-up-v3
npm run android
```

## Cost Breakdown
- **Free tier**: $200/month credit
- **Map loads**: $7 per 1,000 loads
- **Your free quota**: ~28,500 map loads/month
- **Real usage**: Probably 50-200 loads/month for development

## Security Notes
- ✅ Restrict API key to your Android package
- ✅ Monitor usage in Google Cloud Console
- ✅ Set up billing alerts (optional)

**Total time: 5 minutes**
**Total cost: $0 for development and small-scale production**
