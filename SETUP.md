# Ping Friends App Setup Guide

This guide will help you set up the Supabase backend for the Ping Friends app.

## Supabase Setup

1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com/) and sign up or log in
   - Create a new project and note your project URL and anon key

2. **Set Up Authentication**:
   - In the Supabase dashboard, go to Authentication → Settings
   - Configure Email Authentication (the default)
   - Optionally enable "Confirm email" if you want email verification

3. **Create Database Tables**:
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL script in `scripts/create_profiles_table.sql` to create the profiles table
   - This will create the necessary table with row-level security policies

## App Configuration

1. **Update Supabase Credentials**:
   - Edit `lib/supabase.ts` and verify your Supabase URL and anon key are correct
   - These should match the values found in your Supabase project settings

2. **Run the App**:
   ```bash
   npm install
   npm start
   ```

## Troubleshooting

- If you encounter issues with authentication, make sure your Supabase credentials are correct
- Check that the profiles table was created successfully
- Verify that email authentication is enabled in your Supabase project

## Next Steps

After authentication is working, you can continue to develop:

1. User profiles
2. Friend requests system
3. Location services
4. Map interface 