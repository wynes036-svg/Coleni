# 🚀 How to Run Coleni - Super Simple Guide

## Option 1: Run on Your Computer (Friends on Same WiFi Only)

### Step 1: Open Terminal/Command Prompt
- Windows: Press `Win + R`, type `cmd`, press Enter
- Mac: Press `Cmd + Space`, type `terminal`, press Enter

### Step 2: Go to Coleni Folder
```
cd coleni
```

### Step 3: Install (First Time Only)
```
npm install
```
Wait for it to finish (takes 1-2 minutes)

### Step 4: Start the App
```
npm start
```

### Step 5: Open in Browser
- On your computer: Open browser and go to `http://localhost:3000`
- On your phone (same WiFi): Use the "Mobile:" link shown in terminal

### To Stop the App
Press `Ctrl + C` in the terminal

---

## Option 2: Put Online (Friends Anywhere Can Join)

### Step 1: Create GitHub Account
Go to https://github.com and sign up (it's free)

### Step 2: Install Git (if you don't have it)
- Windows: Download from https://git-scm.com/download/win
- Mac: Open terminal and type `git --version` (it will install automatically)

### Step 3: Upload Your Code to GitHub

Open terminal in the coleni folder and run these commands ONE BY ONE:

```
git init
```
```
git add .
```
```
git commit -m "My Coleni app"
```

Now go to https://github.com/new
- Type "coleni" as the name
- Click "Create repository"
- Copy the commands it shows you (they look like this):

```
git remote add origin https://github.com/YOUR_USERNAME/coleni.git
```
```
git push -u origin main
```

### Step 4: Deploy on Render

1. Go to https://render.com
2. Click "Get Started" (sign up with your GitHub account)
3. Click "New +" button at the top
4. Click "Web Service"
5. Find "coleni" in the list and click "Connect"
6. Click "Create Web Service" at the bottom
7. Wait 3-5 minutes

### Step 5: Get Your Link
Once it says "Live", you'll see a link like:
`https://coleni-something.onrender.com`

**Share this link with your friends!** They can access it from anywhere.

---

## Which Option Should I Choose?

**Choose Option 1 if:**
- You just want to test it quickly
- Only chatting with people in the same room/house
- Don't want to deal with GitHub

**Choose Option 2 if:**
- You want friends from different places to join
- You want a permanent link
- You want it to work on any network

---

## Need Help?

**App won't start?**
- Make sure you have Node.js installed: https://nodejs.org
- Try running `npm install` again

**Can't access on phone?**
- Make sure phone and computer are on the same WiFi
- Try turning off your computer's firewall temporarily

**Render deployment failed?**
- Check that you pushed all files to GitHub
- Make sure the repository is public (not private)

---

## Quick Reference

**Start app locally:**
```
cd coleni
npm start
```

**Stop app:**
Press `Ctrl + C`

**Update app on Render:**
```
git add .
git commit -m "Updated app"
git push
```
(Render will automatically update in 2-3 minutes)

---

That's it! Enjoy Coleni! 🎉
