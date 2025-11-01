# AgriClip Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code committed to GitHub
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend starts without errors
- [ ] Model service starts without errors
- [ ] All environment variables documented

### ✅ Configuration Files Created
- [ ] `vercel.json` - Frontend routing configuration
- [ ] `server/railway.toml` - Backend deployment configuration  
- [ ] `model/railway.toml` - Model service deployment configuration
- [ ] `server/.env.production.example` - Production environment template
- [ ] `DEPLOYMENT.md` - Complete deployment guide

### ✅ Environment Variables Prepared
- [ ] MongoDB Atlas connection string
- [ ] JWT secret (minimum 32 characters)
- [ ] Gmail credentials (email + app password)
- [ ] Frontend URL for CORS
- [ ] Model service URL

## Deployment Steps

### 1. Database Setup (MongoDB Atlas)
- [ ] Create MongoDB Atlas account
- [ ] Create free cluster
- [ ] Create database user
- [ ] Get connection string
- [ ] Whitelist Railway IPs (or 0.0.0.0/0)

### 2. Email Setup (Gmail)
- [ ] Enable 2FA on Gmail account
- [ ] Generate app-specific password
- [ ] Test email credentials

### 3. Deploy Model Service (Railway)
- [ ] Create Railway account
- [ ] Deploy from GitHub (model folder)
- [ ] Set environment variables
- [ ] Verify deployment and health check
- [ ] Note the model service URL

### 4. Deploy Backend (Railway)
- [ ] Create new Railway service
- [ ] Deploy from GitHub (server folder)
- [ ] Set all environment variables:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET
  - [ ] GMAIL_USER
  - [ ] GMAIL_PASS
  - [ ] MODEL_SERVICE_URL
  - [ ] FRONTEND_URL (will update after frontend deployment)
  - [ ] NODE_ENV=production
- [ ] Verify deployment and health check
- [ ] Note the backend service URL

### 5. Deploy Frontend (Vercel)
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Update `vercel.json` with actual backend URL
- [ ] Deploy frontend
- [ ] Note the frontend URL

### 6. Update CORS Configuration
- [ ] Update backend FRONTEND_URL environment variable
- [ ] Redeploy backend service

### 7. Final Testing
- [ ] Test user registration with OTP
- [ ] Test login flow
- [ ] Test image upload and analysis
- [ ] Test chat functionality
- [ ] Test all API endpoints
- [ ] Verify email delivery

## Environment Variables Reference

### Backend (Railway)