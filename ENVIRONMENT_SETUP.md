# Environment Variables Setup Guide

This guide will help you set up environment variables for your Supabase authentication system.

## Quick Setup

### 1. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://your-project-ref.supabase.co`)
   - **anon/public key** (safe for client-side use)
   - **service_role key** (⚠️ **NEVER expose this to client-side code**)

### 2. Create Your Environment File

Copy the example file and fill in your values:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your actual values
nano .env  # or use your preferred editor
```

### 3. Fill in Your Values

Edit your `.env` file with your actual Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
NODE_ENV=development
PORT=3000
```

## Environment Files Structure

### `.env` (Your actual environment file)
- Contains your real credentials
- **Never commit this to git** (already in `.gitignore`)
- Used by your application in development

### `.env.example` (Template file)
- Contains placeholder values
- Safe to commit to git
- Shows other developers what environment variables are needed

### `.env.development` (Development defaults)
- Contains development-specific defaults
- Can be committed to git
- Used as fallback values

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | Yes | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Public/anonymous key (client-safe) | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-only) | `eyJhbGciOiJIUzI1NiIs...` |
| `NODE_ENV` | No | Environment mode | `development`, `production`, `test` |
| `PORT` | No | Application port | `3000` |
| `USE_LOCAL_SUPABASE` | No | Use local Supabase instance | `true`, `false` |

## Security Best Practices

### ✅ Do:
- Use environment variables for all sensitive data
- Keep `.env` files in `.gitignore`
- Use different keys for different environments
- Rotate keys regularly
- Use the service role key only server-side

### ❌ Don't:
- Commit `.env` files to git
- Expose service role keys to client-side code
- Hardcode credentials in your source code
- Share environment files with sensitive data

## Local Development Setup

### Option 1: Using Supabase Cloud (Recommended)

1. Create your `.env` file with cloud credentials
2. Start your application:
   ```bash
   npm run start:dev
   ```

### Option 2: Using Local Supabase

1. Start local Supabase:
   ```bash
   npm run supabase:start
   ```

2. Set environment variable:
   ```bash
   USE_LOCAL_SUPABASE=true npm run start:dev
   ```

## Production Deployment

### Environment Variables in Production

Set these environment variables in your production environment:

```bash
# Production environment variables
NODE_ENV=production
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
PORT=3000
```

### Common Deployment Platforms

#### Heroku
```bash
heroku config:set SUPABASE_URL=https://your-project-ref.supabase.co
heroku config:set SUPABASE_ANON_KEY=your_anon_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Vercel
Add to your `vercel.json` or dashboard:
```json
{
  "env": {
    "SUPABASE_URL": "https://your-project-ref.supabase.co",
    "SUPABASE_ANON_KEY": "your_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key"
  }
}
```

#### Railway
Add in your Railway dashboard under "Variables" tab.

#### Docker
```dockerfile
ENV SUPABASE_URL=https://your-project-ref.supabase.co
ENV SUPABASE_ANON_KEY=your_anon_key
ENV SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase key" error**
   - Check that `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env` file
   - Verify the key is correct (no extra spaces or quotes)

2. **Authentication not working**
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
   - Check that your Supabase project has auth enabled

3. **Environment variables not loading**
   - Make sure your `.env` file is in the project root
   - Restart your development server after changing `.env`

### Testing Your Setup

Test your environment setup:

```bash
# Check if environment variables are loaded
node -e "console.log(process.env.SUPABASE_URL)"
```

## Next Steps

After setting up your environment variables:

1. **Test authentication** using GraphQL Playground
2. **Set up Row Level Security (RLS)** in Supabase
3. **Configure email templates** for auth emails
4. **Set up OAuth providers** if needed

## Support

If you encounter issues:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Verify your environment variables are set correctly
3. Check the application logs for specific error messages
