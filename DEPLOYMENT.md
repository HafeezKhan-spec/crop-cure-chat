# AgriClip Deployment Guide

This guide will help you deploy the AgriClip application using Vercel (frontend) and Railway (backend + AI model).

## Prerequisites

1. GitHub account
2. Vercel account (free)
3. Railway account (free)
4. MongoDB Atlas account (free)
5. Gmail account with App Password

## Step 1: Prepare Your Repository

1. Push your code to GitHub
2. Ensure all deployment files are included:
   - `vercel.json` (frontend routing)
   - `server/railway.toml` (backend config)
   - `server/.env.production.example` (environment template)

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Whitelist Railway's IP addresses (or use 0.0.0.0/0 for simplicity)

## Step 3: Set Up Gmail App Password

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Save this password for later use

## Step 4: Deploy Backend to Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Choose the `server` folder as the root directory
5. Set environment variables: