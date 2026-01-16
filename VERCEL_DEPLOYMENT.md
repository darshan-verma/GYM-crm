# Vercel Deployment Guide

This guide helps you deploy the Pro Bodyline CRM to Vercel successfully.

## Prisma Configuration

The project is configured to automatically generate Prisma Client during the build process:

- **Build Script**: `prisma generate && next build`
- **Postinstall Script**: `prisma generate` (runs after npm install)

## Environment Variables

Make sure to set these environment variables in your Vercel project settings:

### Required Variables

1. **DATABASE_URL**
   - Your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - Use Vercel Postgres or your own PostgreSQL database

2. **NEXTAUTH_SECRET**
   - A random secret key for NextAuth.js
   - Generate one: `openssl rand -base64 32`

3. **NEXTAUTH_URL**
   - Your production URL
   - Example: `https://your-app.vercel.app`

### Optional Variables

4. **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**
   - Your Google Maps API key (if using location picker)
   - Must start with `NEXT_PUBLIC_` to be accessible in the browser

5. **CRON_SECRET**
   - Secret for cron job authentication
   - Generate one: `openssl rand -base64 32`

6. **RESEND_API_KEY** (Optional - for email notifications)
7. **TWILIO_ACCOUNT_SID** (Optional - for SMS)
8. **TWILIO_AUTH_TOKEN** (Optional - for SMS)
9. **TWILIO_PHONE_NUMBER** (Optional - for SMS)

## Deployment Steps

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository

3. **Configure Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add all required variables listed above
   - Make sure to add them for "Production", "Preview", and "Development" environments

4. **Configure Build Settings**
   - Build Command: `npm run build` (already configured in package.json)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

5. **Deploy**
   - Click "Deploy"
   - Vercel will automatically:
     - Install dependencies
     - Run `prisma generate` (via postinstall script)
     - Run `prisma generate && next build` (via build script)
     - Deploy your application

## Troubleshooting

### Prisma Client Not Generated

If you see errors about Prisma Client not being generated:

1. **Check Build Logs**
   - Look for `prisma generate` in the build output
   - It should run automatically via the build script

2. **Verify package.json**
   - Ensure build script includes: `"build": "prisma generate && next build"`
   - Ensure postinstall script: `"postinstall": "prisma generate"`

3. **Clear Vercel Build Cache**
   - Go to Project Settings → General
   - Click "Clear Build Cache"
   - Redeploy

### Database Connection Issues

1. **Check DATABASE_URL**
   - Ensure it's correctly formatted
   - Test the connection string locally

2. **Database Migrations**
   - Run migrations before deploying:
     ```bash
     npx prisma migrate deploy
     ```
   - Or use Vercel's database integration

3. **Connection Pooling**
   - For serverless, consider using a connection pooler like:
     - Prisma Data Proxy
     - PgBouncer
     - Supabase connection pooling

### Build Timeout

If builds are timing out:

1. **Optimize Prisma Schema**
   - Remove unused models/fields
   - Use `prisma generate --no-engine` for faster generation

2. **Increase Build Timeout**
   - Vercel Pro: 45 minutes
   - Vercel Hobby: 45 minutes (default)

## Post-Deployment

1. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed Database** (if needed)
   ```bash
   npm run db:seed
   ```

3. **Verify Environment Variables**
   - Check that all variables are set correctly
   - Test the application functionality

## Additional Resources

- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js on Vercel](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
