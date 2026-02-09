# Valentines Website

A modern, beautiful website built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel is the best platform for Next.js apps. It offers:
- ✅ Free hosting
- ✅ Automatic deployments from Git
- ✅ Custom domains
- ✅ SSL certificates
- ✅ Global CDN

#### Setup Steps:

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and configure everything
   - Click "Deploy"
   - Your site will be live in ~2 minutes!

3. **Future Updates:**
   - Just push to your GitHub repository
   - Vercel automatically deploys every push
   - No manual steps needed!

### Option 2: Deploy to Netlify

1. Push code to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. Sign up/login with GitHub
4. Click "New site from Git"
5. Select your repository
6. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
7. Click "Deploy"

### Option 3: Deploy to GitHub Pages

1. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "export": "next export",
     "deploy": "npm run build && npm run export && gh-pages -d out"
   }
   ```

3. Run:
   ```bash
   npm run deploy
   ```

## 🛠️ Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── public/             # Static assets (images, etc.)
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── tailwind.config.ts  # Tailwind CSS config
└── next.config.js      # Next.js config
```

## 🎨 Customization

- **Edit content:** Modify `app/page.tsx`
- **Change styles:** Edit `app/globals.css` or use Tailwind classes
- **Add pages:** Create new files in `app/` directory
- **Add components:** Create a `components/` folder

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🔄 Updating Your Site

1. Make changes to your code
2. Test locally: `npm run dev`
3. Commit changes: `git add . && git commit -m "Update site"`
4. Push to GitHub: `git push`
5. Vercel/Netlify will automatically deploy!

---

Built with ❤️ using Next.js
