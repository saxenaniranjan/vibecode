# ⚡ Quick Start Commands

## Local Development

```bash
# Start development server (already running!)
npm run dev

# Visit: http://localhost:3000
```

## Git Commands (Push to GitHub)

**Remote is already set:** `https://github.com/saxenaniranjan/vibecode.git`

```bash
# Push to GitHub (run from project folder; you may be prompted to sign in)
git push -u origin main
```

If the repo already has commits (e.g. README only), use:
```bash
git push -u origin main --force
```

## Future Updates

```bash
# Make changes, then:
git add .
git commit -m "Your update message"
git push

# Vercel will auto-deploy!
```

## Build for Production

```bash
# Test production build locally
npm run build
npm start

# Or just push to GitHub - Vercel handles it!
```

---

**Current Status:**
- ✅ Dependencies installed
- ✅ Git initialized
- ✅ Dev server running
- ⏳ **Next:** Push to GitHub → Deploy on Vercel
