# Vercel File Upload Fix

## Issue
Member creation was failing on Vercel because the code tried to write files to the filesystem, which is **read-only on Vercel** (except for `/tmp` which is ephemeral).

## Fix Applied
✅ **Photo uploads are now optional** - Member creation will succeed even if photo upload fails
✅ **Better error handling** - More detailed error messages to help debug issues
✅ **Empty string handling** - Empty strings are now converted to `null` for optional fields (Prisma requirement)
✅ **Activity log resilience** - Activity logging won't block member creation if it fails

## What Changed
1. **File uploads** are wrapped in try-catch - they'll fail silently on Vercel but won't block member creation
2. **Empty strings** are converted to `null` for optional fields (email, address, trainerId, etc.)
3. **Activity logging** is wrapped in try-catch to prevent blocking
4. **Error messages** are more descriptive

## Current Behavior
- ✅ **Member creation works** on Vercel (without photo uploads)
- ⚠️ **Photo uploads fail silently** on Vercel (photos won't be saved)
- ✅ **All other member data** is saved correctly

## For Production (Recommended)
To enable photo uploads on Vercel, you need to use a cloud storage service:

### Option 1: Vercel Blob (Recommended for Vercel)
```bash
npm install @vercel/blob
```

Then update `lib/actions/members.ts` to use Vercel Blob instead of filesystem writes.

### Option 2: Cloudinary
```bash
npm install cloudinary
```

### Option 3: AWS S3
```bash
npm install @aws-sdk/client-s3
```

### Option 4: Uploadcare / ImageKit
Other popular image hosting services.

## Testing
After deploying, try creating a member:
1. Go to `/members/new`
2. Fill in the form (photo is optional)
3. Submit
4. Member should be created successfully ✅

If it still fails, check:
- Vercel function logs for detailed error messages
- Database connection (DATABASE_URL in Vercel env vars)
- Required fields are filled (name, phone)

## Next Steps
1. **Deploy the fix** to Vercel
2. **Test member creation** without photo
3. **Optionally implement** cloud storage for photos (Vercel Blob is easiest)
