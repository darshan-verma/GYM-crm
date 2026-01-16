# Neon Database Setup Guide

## Quick Setup Steps

### Step 1: Get Your Neon Database URL

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **Connection Details** or **Dashboard**
4. Copy your **Connection String** (it looks like: `postgresql://user:password@host/database?sslmode=require`)

### Step 2: Run Migrations (Create Tables)

Run this command locally with your Neon DATABASE_URL:

```bash
# Set your Neon database URL
export DATABASE_URL="postgresql://neondb_owner:npg_iwv9HdV7UpLF@ep-orange-morning-a1br5zgm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Run migrations to create all tables
npx prisma migrate deploy
```

**OR** use the npm script:

```bash
DATABASE_URL="your_neon_connection_string_here" npm run migrate:prod
```

### Step 3: Seed Database (Create Admin User)

After migrations complete, seed the database:

```bash
# Make sure DATABASE_URL is set to your Neon URL
DATABASE_URL="postgresql://neondb_owner:npg_iwv9HdV7UpLF@ep-orange-morning-a1br5zgm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run db:seed
```

This will create:
- **Admin User**: `admin@probodyline.com` / `admin123`
- **Trainer User**: `trainer@probodyline.com` / `trainer123`
- Sample membership plans, members, payments, etc.

### Step 4: Verify in Vercel

1. Make sure your Vercel project has the `DATABASE_URL` environment variable set to your Neon connection string
2. Redeploy your Vercel app if needed
3. Try logging in with:
   - **Email**: `admin@probodyline.com`
   - **Password**: `admin123`

## Alternative: Quick Admin User Only

If you only need an admin user (without sample data), you can use the simpler script:

```bash
DATABASE_URL="your_neon_connection_string_here" node scripts/create-admin.mjs
```

This creates:
- **Email**: `admin@probodyline.com`
- **Password**: `admin123`
- **Role**: `SUPER_ADMIN`

## Troubleshooting

### Error: "The table does not exist"
- Make sure you ran `prisma migrate deploy` first (Step 2)

### Error: "Connection refused" or "Cannot connect"
- Check your Neon DATABASE_URL is correct
- Make sure your Neon database is running (not paused)
- Verify the connection string includes `?sslmode=require` for SSL

### Error: "Migration already applied"
- This is fine! Your tables already exist. Just run the seed command.

## Verify Setup

You can verify your setup by:

1. **Check tables exist**:
   ```bash
   DATABASE_URL="your_neon_connection_string_here" npx prisma studio
   ```
   This opens Prisma Studio where you can see all your tables and data.

2. **Check admin user exists**:
   ```bash
   DATABASE_URL="your_neon_connection_string_here" npx prisma db execute --stdin <<< "SELECT email, role FROM \"User\" WHERE email = 'admin@probodyline.com';"
   ```

## Important Notes

- **Never commit your DATABASE_URL** to git
- Use environment variables in Vercel
- Neon databases auto-pause after inactivity (free tier) - they'll wake up on first connection
- The connection string from Neon already includes SSL settings
