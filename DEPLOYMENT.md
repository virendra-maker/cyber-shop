# Cyber Shop - Deployment Guide

This guide covers deploying Cyber Shop to Render and Vercel platforms.

## Prerequisites

- GitHub account with the code repository
- Manus OAuth credentials (VITE_APP_ID, etc.)
- MySQL database (TiDB, Planetscale, or managed MySQL)
- Admin UPI ID for payment collection

## Deployment to Render

### Step 1: Connect GitHub Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Select "Build and deploy from a Git repository"
4. Connect your GitHub account and select `cyber-shop` repository
5. Choose the `main` branch

### Step 2: Configure Build Settings

1. **Name**: `cyber-shop` (or your preferred name)
2. **Environment**: `Node`
3. **Build Command**: `pnpm install && pnpm build`
4. **Start Command**: `pnpm start`
5. **Plan**: Choose based on your needs (Free tier available)

### Step 3: Add Environment Variables

In the Render dashboard, add the following environment variables:

```
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/cyber_shop
JWT_SECRET=your_secure_jwt_secret
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Your Name
VITE_APP_TITLE=Cyber Shop - Hacking Tools and Services
VITE_APP_LOGO=/logo.svg
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_api_key
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically start building and deploying
3. Monitor the deployment in the Logs tab
4. Once complete, your app will be available at `https://cyber-shop.onrender.com`

### Step 5: Configure Custom Domain (Optional)

1. Go to Settings → Custom Domain
2. Add your domain (e.g., `cybershop.com`)
3. Update DNS records as instructed by Render

## Deployment to Vercel

### Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Search for and select `cyber-shop` repository
5. Click "Import"

### Step 2: Configure Project

1. **Framework Preset**: Select "Other" (for custom Node.js setup)
2. **Build Command**: `pnpm build`
3. **Output Directory**: `dist`
4. **Install Command**: `pnpm install`

### Step 3: Add Environment Variables

In the Vercel project settings, add environment variables:

1. Go to Settings → Environment Variables
2. Add all variables listed above in the Render section
3. Make sure to add them for all environments (Production, Preview, Development)

### Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Your app will be available at `https://cyber-shop.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Database Setup

### For TiDB (Recommended for Render/Vercel)

1. Create a TiDB Serverless cluster
2. Get the connection string
3. Use it as `DATABASE_URL` in environment variables

### For Planetscale

1. Create a Planetscale database
2. Get the MySQL connection string
3. Use it as `DATABASE_URL`

### For Local MySQL

For development, use:
```
DATABASE_URL=mysql://root:password@localhost:3306/cyber_shop
```

## Post-Deployment Steps

### 1. Run Database Migrations

After deployment, run migrations:

```bash
pnpm db:push
```

Or access your deployed app and the migrations will run automatically on first connection.

### 2. Set Up Admin Account

1. Sign in to your deployed app
2. Access the database and update your user's role to `admin`
3. Navigate to `/admin` to access the admin panel

### 3. Configure Payment Settings

1. Log in as admin
2. Go to Admin Dashboard → Settings
3. Add your UPI ID and payment details
4. Save the settings

### 4. Add Initial Products

1. Go to Admin Dashboard → Products
2. Click "Add Product"
3. Fill in product details (name, price, description, etc.)
4. Save the product

## Monitoring and Logs

### Render

- Logs are available in the Web Service dashboard
- Use `render logs` command in Render CLI for real-time logs

### Vercel

- Logs are available in Deployments tab
- Real-time logs available in Function logs

## Troubleshooting

### Build Fails

**Error**: `pnpm: command not found`
- **Solution**: Ensure `pnpm` is installed. Add `pnpm` to your build command or use `npm` instead.

**Error**: `Database connection failed`
- **Solution**: Check DATABASE_URL is correct and database is accessible from your deployment region.

### App Won't Start

**Error**: `Cannot find module`
- **Solution**: Run `pnpm install` locally and commit `pnpm-lock.yaml` to GitHub.

**Error**: `OAuth callback URL mismatch`
- **Solution**: Update your Manus OAuth app settings with the correct callback URL (e.g., `https://cyber-shop.onrender.com/api/oauth/callback`).

### Payment Features Not Working

**Error**: `Admin settings not found`
- **Solution**: Make sure you've configured payment settings in the admin panel.

**Error**: `UPI ID not displaying`
- **Solution**: Verify the admin has set the UPI ID in Settings → Admin Settings.

## Performance Optimization

### For Render

- Use Render's PostgreSQL add-on for better performance
- Enable auto-scaling for production plans
- Use Redis for session caching (optional)

### For Vercel

- Enable Edge Caching for static assets
- Use Vercel's built-in analytics
- Consider upgrading to Pro plan for better performance

## Security Recommendations

1. **Use HTTPS**: Both Render and Vercel provide free SSL/TLS
2. **Secure Secrets**: Never commit `.env` files to GitHub
3. **Database Security**: Use strong passwords and restrict access
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **CORS Configuration**: Restrict CORS to your domain only

## Scaling Considerations

### Render

- Free tier: 0.5 CPU, 512 MB RAM
- Paid tiers: Up to 8 CPU, 32 GB RAM
- Auto-scaling available on paid plans

### Vercel

- Serverless functions scale automatically
- Pay only for what you use
- Supports up to 50 concurrent functions

## Backup and Recovery

### Database Backups

1. **Render**: Use Render's backup features if available
2. **Vercel**: Implement database backups separately
3. **Manual**: Export database regularly using MySQL tools

### Code Backups

- GitHub automatically backs up your code
- Use GitHub's release feature for version control

## Next Steps

1. Test all payment workflows in production
2. Monitor logs and performance metrics
3. Set up email notifications for errors
4. Create a monitoring dashboard
5. Plan for scaling as users grow

## Support

For deployment issues:
- Render Support: https://render.com/support
- Vercel Support: https://vercel.com/support
- GitHub Issues: Create an issue in your repository

---

**Last Updated**: November 2024
**Version**: 1.0.0
