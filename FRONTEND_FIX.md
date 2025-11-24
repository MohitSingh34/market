# Frontend Startup Fix - Instructions

## Problem Identified
The frontend was failing due to:
1. **Bus error** with Next.js 16 + React Compiler
2. **Permission issues** with node_modules

## Fixes Applied
1. ✅ Disabled React Compiler in `next.config.ts`
2. ✅ Removed `babel-plugin-react-compiler` package
3. ✅ Simplified Next.js configuration
4. ✅ Cleaned and reinstalled dependencies

## Manual Steps to Run Frontend

### Option 1: Clean Install (Recommended)
```bash
cd /home/mohit/Projects/market/client

# Clean everything
rm -rf node_modules package-lock.json .next

# Reinstall dependencies
npm install

# Run dev server
npm run dev
```

### Option 2: Quick Start
```bash
cd /home/mohit/Projects/market/client
npm run dev
```

## Verification Steps

1. **Start Backend** (if not already running):
   ```bash
   cd /home/mohit/Projects/market
   npm run start:dev
   ```

2. **Start Frontend**:
   ```bash
   cd /home/mohit/Projects/market/client
   npm run dev
   ```

3. **Open Browser**:
   - Navigate to: http://localhost:3000
   - You should see:
     - Tick counter updating
     - 200 agents (green/orange dots) moving
     - 10 shops (blue rectangles) with labels
     - "Add Shop" button in top-right

## If Still Failing

### Check Node Version
```bash
node --version  # Should be 18+ or 20+
```

### Try Building First
```bash
npm run build
# If build succeeds, then run:
npm run dev
```

### Check Logs
```bash
npm run dev 2>&1 | tee frontend.log
# Share frontend.log for debugging
```

## Files Modified
- `client/next.config.ts` - Disabled React Compiler
- `client/package.json` - Updated dependencies
- `client/components/MapCanvas.tsx` - Fixed SSR issues
