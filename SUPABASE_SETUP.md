# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for partner logo uploads in the Notice Sender.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Get your project credentials from **Settings → API**

## Step 2: Set Environment Variables

Add these to your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## Step 3: Create Storage Bucket

In Supabase dashboard:

1. Go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Name it: `partner-logos`
4. **Make it public** so URLs work in emails
5. Click **Create bucket**

## Step 4: Set Bucket Policies (Optional)

To allow uploads from your app, you can configure policies. For now, the anonymous key will work for uploads.

## Step 5: Test It Out

1. Go to Notice Sender
2. Under "Partner Logo", upload a company logo
3. The file automatically uploads to Supabase
4. You'll see a preview and confirmation message
5. Send a test campaign - logo appears in email!

## Troubleshooting

- **"Supabase credentials not configured"** - Check `.env.local` has the right variables
- **"Could not upload"** - Verify bucket is public
- **Logo not showing in email** - Check the URL is accessible publicly

## Using Multiple Partner Logos

Each time you upload a logo, it gets a unique filename based on the property management name and timestamp, so you can manage multiple logos in the same bucket.

You can view/delete them anytime in the Supabase Storage dashboard.

