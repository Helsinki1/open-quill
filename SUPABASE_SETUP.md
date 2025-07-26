# Supabase Authentication Setup

This app uses Supabase for user authentication to protect copy and paste functionality.

## Setup Steps

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up

### 2. Get Your Project Keys
1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - anon/public key

### 3. Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values with your actual Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Configure Authentication Providers (Optional)
1. In your Supabase dashboard, go to Authentication > Providers
2. Enable the providers you want (Google, GitHub, etc.)
3. Configure the OAuth settings for each provider

### 5. Run the Application
```bash
npm run dev
```

## Features

- **Copy Protection**: Users must sign in to copy text from the editor
- **Free Paste**: Users can paste content without authentication
- **Visual Indicators**: The copy button shows a lock icon when user is not authenticated
- **Modal Authentication**: Clean, themed sign-in modal that matches the app's design
- **Multiple Providers**: Support for email/password, Google, GitHub, and other OAuth providers

## How It Works

- When users try to copy text, the app checks if they're authenticated
- If not authenticated, a sign-in modal appears
- Users can paste content freely without authentication
- Once signed in, users can copy content without restrictions
- Authentication state persists across browser sessions
- The UI dynamically updates to show authentication status 