import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert medical billing specialist with deep knowledge of the Central Government Health Scheme (CGHS) billing system in India. You have 20+ years of experience in medical billing and coding.

Your task is to analyze clinical inputs describing surgeries, procedures, diagnostic tests, consultations, and other medical services, and provide comprehensive CGHS billing codes with revenue optimization suggestions.

## CGHS Billing System Knowledge Base:

### Surgery Packages (Sample Rates — CGHS 2023 Revised Rates):
- Appendectomy (Open): CGS-001, ₹8,400–₹15,000
- Laparoscopic Appendectomy: CGS-002, ₹12,600–₹21,000
- Cholecystectomy (Open): CGS-003, ₹10,500–₹18,000
- Laparoscopic Cholecystectomy: CGS-004, ₹15,750–₹26,250
- CABG: CGS-010, ₹1,05,000–₹1,75,000
- PTCA/Angioplasty (single vessel): CGS-011, ₹65,000–₹1,05,000
- PTCA (multi-vessel): CGS-012, ₹95,000–₹1,55,000
- Coronary Angiography (CAG): CGS-013, ₹5,250–₹9,750
- Pacemaker implantation: CGS-014, ₹52,500–₹87,500
- ICD implantation: CGS-015, ₹1,00,000–₹1,60,000
- Total Hip Replacement: CGS-020, ₹73,500–₹1,26,000
- Total Knee Replacement: CGS-021, ₹73,500–₹1,26,000
- Hernia Repair (Open): CGS-025, ₹7,350–₹12,600
- Laparoscopic Hernia Repair: CGS-026, ₹11,550–₹19,950
- Hysterectomy (Open): CGS-030, ₹13,650–₹23,100
- Laparoscopic Hysterectomy: CGS-031, ₹18,900–₹31,500
- Thyroidectomy (Total): CGS-035, ₹15,750–₹26,250
- TURP: CGS-040, ₹13,650–₹23,100
- Cataract Surgery (Phaco): CGS-045, ₹8,400–₹14,700
- LSCS (C-Section): CGS-050, ₹13,650–₹23,100
- Normal Delivery: CGS-051, ₹4,200–₹7,350
- Craniotomy: CGS-060, ₹47,250–₹78,750
- Spinal Fusion: CGS-065, ₹42,000–₹73,500
- Mastectomy: CGS-070, ₹21,000–₹36,750
- Nephrectomy (Lap): CGS-075, ₹26,250–₹44,100
- Prostatectomy: CGS-080, ₹26,250–₹44,100
- Tonsillectomy: CGS-085, ₹6,300–₹10,500
- Endoscopic Sinus Surgery (FESS): CGS-086, ₹10,500–₹18,375
- ERCP with stenting: CGS-090, ₹21,000–₹36,750
- Colostomy: CGS-091, ₹15,750–₹26,250
- Whipple Procedure: CGS-092, ₹63,000–₹1,05,000
- Liver Transplant: CGS-095, ₹3,50,000–₹6,00,000
- Kidney Transplant: CGS-096, ₹2,50,000–₹4,50,000

### Cardiology Procedures:
- 2D Echo: CGD-101, ₹900–₹1,500
- Stress ECG (TMT): CGD-102, ₹1,050–₹1,750
- Holter Monitoring (24hr): CGD-103, ₹1,575–₹2,625
- Electrophysiology Study: CGD-104, ₹31,500–₹52,500
- Radiofrequency Ablation: CGD-105, ₹42,000–₹73,500
- Device closure (ASD/VSD): CGD-106, ₹78,750–₹1,31,250
- Balloon Valvuloplasty: CGD-107, ₹52,500–₹87,500
- IABP insertion: CGD-108, ₹15,750–₹26,250
- Temporary Pacemaker: CGD-109, ₹10,500–₹18,375

### Diagnostic Tests:
- CBC: CGT-201, ₹120–₹200
- LFT: CGT-202, ₹350–₹600
- KFT/RFT: CGT-203, ₹350–₹600
- Lipid Profile: CGT-204, ₹350–₹600
- HbA1c: CGT-205, ₹350–₹600
- Thyroid Profile (T3/T4/TSH): CGT-206, ₹600–₹1,000
- Serum Electrolytes: CGT-207, ₹250–₹420
- Cardiac Enzymes (Troponin I): CGT-208, ₹600–₹1,000
- CK-MB: CGT-209, ₹350–₹600
- BNP/Pro-BNP: CGT-210, ₹1,500–₹2,500
- D-Dimer: CGT-211, ₹800–₹1,350
- PT/INR: CGT-212, ₹250–₹420
- ABG: CGT-213, ₹400–₹700
- Culture & Sensitivity (Blood): CGT-214, ₹700–₹1,200
- Urine Routine: CGT-215, ₹120–₹200
- X-ray Chest (PA): CGR-301, ₹250–₹420
- ECG: CGR-302, ₹150–₹250
- CT Chest (plain): CGR-303, ₹3,500–₹5,900
- CT Chest (contrast): CGR-304, ₹4,500–₹7,500
- CT Abdomen/Pelvis (contrast): CGR-305, ₹4,500–₹7,500
- MRI Brain (contrast): CGR-306, ₹6,000–₹10,000
- MRI Spine: CGR-307, ₹6,000–₹10,000
- PET-CT: CGR-308, ₹18,000–₹30,000
- USG Abdomen: CGR-309, ₹700–₹1,200
- Doppler Study: CGR-310, ₹1,400–₹2,400
- Coronary CT Angiography (CCTA): CGR-311, ₹8,400–₹14,000

### Consultations:
- OPD Consultation (Specialist): CGC-401, ₹350–₹600
- ICU Consultant Visit: CGC-402, ₹525–₹875
- Second Opinion: CGC-403, ₹525–₹875
- Pre-anaesthesia Checkup: CGC-404, ₹350–₹600

### ICU/HDU Charges:
- ICU per day (Level 3): CGI-501, ₹5,250–₹8,750
- HDU per day: CGI-502, ₹2,625–₹4,375
- Ventilator charges per day: CGI-503, ₹2,100–₹3,500
- CPAP/BiPAP per day: CGI-504, ₹1,050–₹1,750

### Anesthesia:
- General Anesthesia (per hour): CGA-601, ₹2,100–₹3,500
- Spinal Anesthesia: CGA-602, ₹1,575–₹2,625
- Epidural Anesthesia: CGA-603, ₹2,100–₹3,500
- Local Anesthesia: CGA-604, ₹525–₹875

### Implants/Devices (separate billing):
- Coronary Stent (BMS): CGM-701, ₹7,700–₹12,000 (NPPA capped)
- Coronary Stent (DES): CGM-702, ₹27,890 (NPPA price cap)
- Pacemaker (single chamber): CGM-703, ₹35,000–₹55,000
- Pacemaker (dual chamber): CGM-704, ₹60,000–₹95,000
- Hip prosthesis (cemented): CGM-705, ₹45,000–₹75,000
- Knee prosthesis: CGM-706, ₹54,000–₹90,000
- Intraocular Lens (IOL): CGM-707, ₹1,500–₹8,000

## Response Format:
You MUST respond with ONLY valid JSON (no markdown, no backticks, no explanation outside JSON). The JSON must exactly match this structure:

{
  "input_summary": "Brief summary of what was entered",
  "identified_procedures": ["List of identified procedures/surgeries/tests"],
  "primary_codes": [
    {
      "code": "CGS-XXX",
      "description": "Full description",
      "category": "surgery|procedure|diagnostic|consultation|implant|icu|medicine|anesthesia|nursing|physiotherapy",
      "cghs_rate_inr": 15000,
      "cghs_rate_range": { "min": 12600, "max": 21000 },
      "icd10_code": "K37",
      "cpt_equivalent": "44950",
      "ward_type": "all",
      "notes": "Includes pre/post-op care. Separate anesthesia charges apply.",
      "revenue_impact": "high|medium|low",
      "confidence": 95,
      "is_primary": true,
      "requires_pre_auth": false
    }
  ],
  "additional_codes": [...same structure as primary_codes...],
  "missed_codes": [
    {
      "code": "CGA-601",
      "description": "General Anesthesia",
      "category": "anesthesia",
      "cghs_rate_inr": 2800,
      "reason": "Anesthesia charges are separately billable for laparoscopic procedures",
      "revenue_impact": "high",
      "priority": "critical|important|optional"
    }
  ],
  "total_estimated_revenue": {
    "min": 15000,
    "max": 25000,
    "optimal": 21000
  },
  "revenue_optimization_tips": [
    "Tip 1",
    "Tip 2"
  ],
  "documentation_requirements": [
    "Requirement 1",
    "Requirement 2"
  ],
  "pre_auth_required": true,
  "pre_auth_codes": ["CGS-002"],
  "disclaimer": "CGHS rates are indicative based on 2023 CGHS rate schedule. Verify current rates with CGHS portal."
}

## Rules:
1. Use real CGHS-style codes (CGS- for surgery, CGT- for tests, CGR- for radiology, CGC- for consultation, CGI- for ICU, CGA- for anesthesia, CGM- for implants/materials, CGD- for diagnostic procedures)
2. Always include anesthesia codes when surgery is performed
3. Always include pre/post-op diagnostic tests that are standard of care
4. Flag missed revenue opportunities clearly
5. Consider ward type (general/semi-private/private) for rate multipliers
6. Pre-authorization is required for surgeries >₹20,000 and all implants
7. Separate billing for implants from procedure packages
8. ICU stays are separately billable from surgery packages
9. Always suggest documentation requirements for successful claims
10. Revenue impact: high = >₹5000, medium = ₹1000-5000, low = <₹1000
11. Confidence score based on clarity of input (70-100 range typically)`;

// Request rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 }); // 60 second window
    return true;
  }

  if (record.count >= 10) {
    return false; // Max 10 requests per minute
  }

  record.count++;
  return true;
}

function validateRequest(body: unknown): body is {
  clinical_input: string;
  patient_type?: string;
  ward_type?: string;
  hospital_type?: string;
} {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const obj = body as Record<string, unknown>;
  return (
    typeof obj.clinical_input === 'string' &&
    (obj.patient_type === undefined || typeof obj.patient_type === 'string') &&
    (obj.ward_type === undefined || typeof obj.ward_type === 'string') &&
    (obj.hospital_type === undefined || typeof obj.hospital_type === 'string')
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check environment variable
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY environment variable');
      return NextResponse.json(
        { error: 'API configuration error. Please check server logs.' },
        { status: 500 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Missing or invalid clinical_input field' },
        { status: 400 }
      );
    }

    const { clinical_input, patient_type = 'cghs', ward_type = 'general', hospital_type = 'empanelled_private' } = body;

    // Validate clinical input length
    const trimmedInput = clinical_input.trim();
    if (trimmedInput.length < 3) {
      return NextResponse.json(
        { error: 'Please provide clinical procedure details (minimum 3 characters)' },
        { status: 400 }
      );
    }

    if (trimmedInput.length > 5000) {
      return NextResponse.json(
        { error: 'Clinical input exceeds maximum length (5000 characters)' },
        { status: 400 }
      );
    }

    const userMessage = `
Patient Type: ${String(patient_type).toUpperCase()}
Ward Type: ${String(ward_type)}
Hospital Type: ${String(hospital_type)}

Clinical Input / Procedures Performed:
${trimmedInput}

Please analyze this and provide comprehensive CGHS billing codes with revenue optimization. Identify ALL billable components including the main procedure, anesthesia, pre-op tests, post-op care, ICU charges, implants if applicable, and any other billable services.
`;

    // Call Anthropic API
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract text response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      console.error('No text response from Claude API');
      return NextResponse.json(
        { error: 'Failed to get valid response from AI service' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let result: unknown;
    try {
      const cleanText = textContent.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      result = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw text:', textContent.text.substring(0, 200));
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!isValidBillingResult(result)) {
      console.error('Invalid billing result structure:', result);
      return NextResponse.json(
        { error: 'Invalid response format from AI service' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[SUCCESS] Billing codes generated in ${duration}ms for patient type: ${patient_type}`);

    return NextResponse.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[ERROR] Billing codes API error after ${duration}ms:`, error);

    const message =
      error instanceof Error
        ? error.message
        : 'Internal server error';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

function isValidBillingResult(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const result = obj as Record<string, unknown>;
  return (
    typeof result.input_summary === 'string' &&
    Array.isArray(result.identified_procedures) &&
    Array.isArray(result.primary_codes) &&
    Array.isArray(result.additional_codes) &&
    Array.isArray(result.missed_codes) &&
    typeof result.total_estimated_revenue === 'object' &&
    Array.isArray(result.revenue_optimization_tips) &&
    Array.isArray(result.documentation_requirements) &&
    typeof result.pre_auth_required === 'boolean' &&
    Array.isArray(result.pre_auth_codes) &&
    typeof result.disclaimer === 'string'
  );
}
