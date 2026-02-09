# Deploy Coleni to Render

## Step-by-Step Deployment Guide

### 1. Prepare Your Code

Your code is already configured for Render! The `render.yaml` file tells Render how to deploy.

### 2. Push to GitHub

First, create a GitHub repository:

1. Go to https://github.com/new
2. Name it "coleni" (or whatever you prefer)
3. Don't initialize with README (we already have files)
4. Click "Create repository"

Then push your code:

```bash
cd coleni
git init
git add .
git commit -m "Initial commit - Coleni chat app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/coleni.git
git push -u origin main
```

### 3. Deploy on Render

1. Go to https://render.com and sign up (free account)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your "coleni" repository
5. Render will auto-detect the `render.yaml` configuration
6. Click "Create Web Service"

### 4. Wait for Deployment

Render will:
- Install dependencies
- Start your server
- Give you a public URL like: `https://coleni-xxxx.onrender.com`

This takes 2-5 minutes.

### 5. Share Your Coleni Link!

Once deployed, your app will be live at your Render URL. Share it with friends!

## Important Notes

- **Free tier**: Your app will sleep after 15 minutes of inactivity (takes ~30 seconds to wake up)
- **Uploads**: Voice notes and photos are stored temporarily (they reset when the server restarts)
- **Custom domain**: You can add your own domain in Render settings

## Troubleshooting

If deployment fails:
1. Check the Render logs for errors
2. Make sure all dependencies are in package.json
3. Verify Node.js version is 18 or higher

## Upgrade to Paid (Optional)

For better performance:
- No sleep time
- Persistent storage for uploads
- Custom domain included
- Starting at $7/month

Enjoy your Coleni chat app! 🎉
