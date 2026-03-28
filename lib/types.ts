export type CodeCategory = 
  | 'surgery'
  | 'procedure'
  | 'diagnostic'
  | 'consultation'
  | 'implant'
  | 'icu'
  | 'medicine'
  | 'anesthesia'
  | 'nursing'
  | 'physiotherapy';

export type RevenueImpact = 'high' | 'medium' | 'low';

export interface BillingCode {
  code: string;
  description: string;
  category: CodeCategory;
  cghs_rate_inr: number;
  cghs_rate_range?: { min: number; max: number };
  icd10_code?: string;
  cpt_equivalent?: string;
  ward_type?: 'general' | 'semi-private' | 'private' | 'all';
  notes?: string;
  revenue_impact: RevenueImpact;
  confidence: number; // 0-100
  is_primary: boolean;
  requires_pre_auth?: boolean;
}

export interface MissedCode {
  code: string;
  description: string;
  category: CodeCategory;
  cghs_rate_inr: number;
  reason: string; // Why this was likely missed
  revenue_impact: RevenueImpact;
  priority: 'critical' | 'important' | 'optional';
}

export interface BillingResult {
  input_summary: string;
  identified_procedures: string[];
  primary_codes: BillingCode[];
  additional_codes: BillingCode[];
  missed_codes: MissedCode[];
  total_estimated_revenue: {
    min: number;
    max: number;
    optimal: number;
  };
  revenue_optimization_tips: string[];
  documentation_requirements: string[];
  pre_auth_required: boolean;
  pre_auth_codes: string[];
  disclaimer: string;
}

export interface InputForm {
  clinical_input: string;
  patient_type: 'cghs' | 'esi' | 'echs' | 'private';
  ward_type: 'general' | 'semi-private' | 'private';
  hospital_type: 'government' | 'empanelled_private';
}
