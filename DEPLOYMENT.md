# 🚀 Deployment Guide

Your website is ready to deploy! Follow these steps to get it live on the internet.

## ✅ What's Already Done

- ✅ Next.js project created with TypeScript & Tailwind CSS
- ✅ Dependencies installed (`npm install` completed)
- ✅ Git repository initialized
- ✅ Initial commit created
- ✅ Development server running locally (http://localhost:3000)

## 📋 What You Need

1. **GitHub Account** (free) - [Sign up here](https://github.com/signup)
2. **Vercel Account** (free) - Can sign up with GitHub

## 🎯 Step-by-Step Deployment

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Name it: `valentines-website` (or any name you prefer)
4. Choose **Public** (or Private - both work with Vercel)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

### Step 2: Push Code to GitHub

**Your repository is already set as remote.** Run this in your terminal (from the project directory):

```bash
cd /Users/niranjansaxena/Desktop/Valentines

# Push your code (GitHub login may be prompted)
git push -u origin main
```

**If the remote has existing commits** (e.g. an initial README), use one of these:

- **Replace repo with this project:**  
  `git push -u origin main --force`

- **Keep repo history and merge:**  
  `git pull origin main --allow-unrelated-histories` then fix any conflicts, then `git push -u origin main`

**Repository:** [github.com/saxenaniranjan/vibecode](https://github.com/saxenaniranjan/vibecode)

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Click **"Add New Project"**
5. Import your `valentines-website` repository
6. Vercel will auto-detect Next.js settings:
   - Framework Preset: **Next.js** ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `.next` ✅
   - Install Command: `npm install` ✅
7. Click **"Deploy"**
8. Wait 1-2 minutes for deployment
9. **🎉 Your site is live!** You'll get a URL like: `https://valentines-website.vercel.app`

### Step 4: Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain (e.g., `yoursite.com`)
4. Follow DNS instructions provided by Vercel

## 🔄 Updating Your Website

Every time you want to update your site:

1. **Make changes** to your code
2. **Test locally:**
   ```bash
   npm run dev
   ```
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update website"
   git push
   ```
4. **Vercel automatically deploys!** (usually takes 1-2 minutes)

That's it! No manual deployment needed. 🎉

## 🌐 Your Live URLs

After deployment, you'll have:
- **Production URL**: `https://your-project.vercel.app` (auto-updates on every push)
- **Preview URLs**: Created for every pull request (great for testing changes)

## 📱 Testing Your Site

1. **Local testing**: Visit http://localhost:3000 (server is already running)
2. **After deployment**: Visit your Vercel URL

## 🛠️ Troubleshooting

### If deployment fails:
- Check Vercel build logs for errors
- Make sure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)

### If site shows 404:
- Make sure `app/page.tsx` exists
- Check that you're accessing the root URL (`/`)

### If styles don't load:
- Verify `tailwind.config.ts` includes all your file paths
- Check that `globals.css` imports Tailwind directives

## 📞 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Documentation](https://docs.github.com)

---

**Your website is production-ready!** 🚀
