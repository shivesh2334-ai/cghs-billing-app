# CGHS BillingAssist — AI-Powered Medical Billing Code Optimizer

An intelligent web application for Indian healthcare providers to generate accurate **CGHS (Central Government Health Scheme)** billing codes from plain-language clinical descriptions.

## Features

- 🤖 **AI-Powered Code Matching** — Describe procedures in plain language, get accurate CGHS codes
- 💰 **Revenue Optimization** — Identifies all billable components to maximize legitimate revenue
- ⚠️ **Missed Code Detection** — Flags commonly missed billing codes with revenue impact
- 📋 **Documentation Checklist** — Lists required documents for successful claims
- 🏥 **Multi-Scheme Support** — CGHS, ESI, ECHS, and private billing
- 🖨️ **Print-Ready** — Clean print layout for records
- 📱 **Mobile-Friendly** — Works on all devices

## Code Categories Supported

| Category | Prefix | Examples |
|----------|--------|---------|
| Surgeries | CGS- | Laparoscopic procedures, CABG, Joint replacement |
| Cardiology Procedures | CGD- | Angiography, PTCA, Ablation |
| Lab Diagnostics | CGT- | CBC, LFT, Cardiac enzymes |
| Radiology | CGR- | X-ray, CT, MRI, PET-CT |
| Consultations | CGC- | OPD, ICU visits |
| ICU/HDU | CGI- | Daily ICU/HDU charges, Ventilator |
| Anesthesia | CGA- | GA, Spinal, Epidural |
| Implants/Devices | CGM- | Stents, Pacemakers, Prosthesis |

---

## Quick Deploy (iPad/Browser Workflow)

### Step 1: Fork or Upload to GitHub

1. Go to [github.com](https://github.com) and create a new repository named `cghs-billing-app`
2. Upload all files from this project (drag & drop in the GitHub web interface)
3. Make sure to include all files but **not** `.env` (it's in `.gitignore`)

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"** → Import your `cghs-billing-app` repository
3. In **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your API key from [console.anthropic.com](https://console.anthropic.com)
4. Click **Deploy** — your app will be live in ~2 minutes!

### Step 3: Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys** → **Create Key**
4. Copy the key and paste it in Vercel's environment variables

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Run development server
npm run dev
# Open http://localhost:3000
```

---

## Usage Examples

**Surgery:**
> "Laparoscopic cholecystectomy for cholelithiasis, 3 days admission, general anesthesia, pre-op LFT and USG abdomen done"

**Cardiology:**
> "Coronary angiography followed by PTCA with DES stent to LAD, patient had 2D Echo and TMT pre-procedure, 2 days ICU stay"

**Orthopaedics:**
> "Total knee replacement right side under spinal anesthesia, 5 days admission, physiotherapy started day 2, implant used"

**Obstetrics:**
> "Emergency LSCS at 38 weeks for fetal distress, epidural anesthesia, neonatal care required, 4 days stay"

---

## Technical Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Anthropic Claude (claude-opus-4-5)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Language**: TypeScript

---

## Disclaimer

CGHS rates and codes in this application are based on publicly available CGHS 2023 rate schedules and are provided for **guidance purposes only**. Always verify:
- Current rates on the official [CGHS portal](https://cghs.gov.in)
- Pre-authorization requirements with your CGHS/TPA office
- Final codes with a qualified medical coder before claim submission

This tool does not constitute professional medical billing advice.

---

## License

MIT License — Free to use and modify for healthcare providers.
