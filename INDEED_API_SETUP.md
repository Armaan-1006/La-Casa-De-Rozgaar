# 🔑 How to Get Your Indeed API Key

## Step 1: Sign Up for Indeed Publisher Account

1. **Go to Indeed Publisher Portal:**
   - Visit: https://www.indeed.com/publisher
   - OR: https://opensource.indeedeng.io/api-documentation/

2. **Create Account:**
   - Click "Sign Up" or "Get Started"
   - Fill in your details:
     - Email address
     - Company/Project name: "La Casa De Rozgaar"
     - Website: Your project URL (or use localhost for now)
   - Agree to Terms of Service

3. **Verify Email:**
   - Check your email inbox
   - Click verification link

4. **Get Your Publisher Key:**
   - Log into your Indeed Publisher account
   - Navigate to "Account" or "API Keys"
   - Copy your **Publisher ID** (this is your API key)
   - It will look something like: `1234567890123456`

## Step 2: Add the Key to Your Project

Once you have your Indeed Publisher ID, I've already prepared the `.env` file.

**Just paste your key after `INDEED_API_KEY=` in `backend/.env`:**

```bash
# Current line in backend/.env:
INDEED_API_KEY=

# After you add your key:
INDEED_API_KEY=1234567890123456
```

## Step 3: Restart Backend

After adding the key:

```bash
# Stop the current backend (Ctrl+C in terminal)
# Then restart:
cd backend
npm run dev
```

## Step 4: Test Indeed Collection

```bash
# Get admin token first
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rozgaar.in","password":"password123"}'

# Then collect from Indeed (replace YOUR_TOKEN)
curl -X POST http://localhost:3001/api/v1/data-collection/collect/indeed \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "software developer",
    "location": "India",
    "limit": 100
  }'
```

---

## ⚠️ Important Notes

### **Indeed API Limits (Free Tier):**
- **Rate Limit:** 60 requests per minute
- **Daily Limit:** Varies by account (usually 100-1000 queries/day)
- **Results per query:** Max 25 results per page

### **Best Practices:**
- Don't exceed rate limits (our system auto-handles this)
- Use specific queries ("Python developer" vs "developer")
- Filter by location to get relevant results
- Collect in batches (limit: 100) rather than all at once

### **Alternative if Indeed Signup Fails:**

Indeed may require business verification for API access. If that's the case:

1. **Use RemoteOK instead** (already works, no key needed):
   ```bash
   curl -X POST http://localhost:3001/api/v1/data-collection/collect/remoteok \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"limit": 100}'
   ```

2. **Wait for GitHub Jobs alternative** (I can add more free APIs)

3. **Use the `/collect/all` endpoint** - it will try all available sources:
   ```bash
   curl -X POST http://localhost:3001/api/v1/data-collection/collect/all \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 📊 Expected Results After Adding Indeed

With Indeed API, you'll be able to collect:
- 100-1000+ jobs per day
- Jobs from 100+ countries
- Salary data (when available)
- Company information
- Apply URLs
- Posted dates

Combined with RemoteOK, you'll have comprehensive market data coverage!

---

## 🎯 Next Steps

1. **Get Indeed Publisher ID** from https://www.indeed.com/publisher
2. **Paste it in `backend/.env`** after `INDEED_API_KEY=`
3. **Restart backend:** `npm run dev`
4. **Test collection:** Use the curl command above
5. **Tell me:** "✅ Indeed API added successfully" or share any errors

---

**Already have a key?** Just paste it in `backend/.env` and restart the backend!
