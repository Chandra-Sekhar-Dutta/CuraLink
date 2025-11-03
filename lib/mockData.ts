export type Expert = {
  id: string;
  name: string;
  specialty: string;
  conditions: string[];
  city: string;
  country: string;
  active: boolean; // active on platform
  email?: string;
};

export type Trial = {
  id: string;
  name: string;
  conditions: string[];
  city: string;
  country: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Completed';
  status: 'Recruiting' | 'Active' | 'Completed' | 'Not Recruiting';
  contactEmail?: string;
  description?: string;
};

export type Publication = {
  id: string;
  title: string;
  conditions: string[];
  year: number;
  url: string;
  abstract?: string;
};

export const EXPERTS: Expert[] = [
  { id: 'exp1', name: 'Dr. Sarah Johnson', specialty: 'Neuro-Oncology', conditions: ['Brain Cancer', 'Glioma'], city: 'Boston', country: 'United States', active: true, email: 'sarah.johnson@hospital.org' },
  { id: 'exp2', name: 'Dr. Michael Chen', specialty: 'Pulmonology', conditions: ['Lung Cancer'], city: 'Chicago', country: 'United States', active: false, email: 'michael.chen@center.edu' },
  { id: 'exp3', name: 'Dr. Emily Rodriguez', specialty: 'Neurosurgery', conditions: ['Glioma'], city: 'Toronto', country: 'Canada', active: true, email: 'emily.rodriguez@clinic.ca' },
  { id: 'exp4', name: 'Dr. Arjun Mehta', specialty: 'Oncology', conditions: ['Breast Cancer'], city: 'London', country: 'United Kingdom', active: false },
  { id: 'exp5', name: 'Dr. Priya Sharma', specialty: 'Infectious Diseases', conditions: ['Fever', 'Dengue', 'Malaria', 'Tropical Diseases'], city: 'Mumbai', country: 'India', active: true, email: 'priya.sharma@hospital.in' },
  { id: 'exp6', name: 'Dr. Rajesh Kumar', specialty: 'Dermatology', conditions: ['Rashes', 'Skin Disorders', 'Dermatitis'], city: 'Delhi', country: 'India', active: true, email: 'rajesh.kumar@clinic.in' },
  { id: 'exp7', name: 'Dr. Maria Santos', specialty: 'Pediatrics', conditions: ['Fever', 'Rashes', 'Childhood Infections'], city: 'Manila', country: 'Philippines', active: true, email: 'maria.santos@peds.ph' },
  { id: 'exp8', name: 'Dr. James Wilson', specialty: 'Internal Medicine', conditions: ['Fever', 'Infectious Diseases'], city: 'New York', country: 'United States', active: true, email: 'james.wilson@med.org' },
];

export const TRIALS: Trial[] = [
  { id: 'tr1', name: 'Glioblastoma Immunotherapy Study', conditions: ['Glioma'], city: 'Boston', country: 'United States', phase: 'Phase II', status: 'Recruiting', contactEmail: 'trial-tr1@ct.org', description: 'A Phase II trial evaluating a novel immunotherapy in GBM.' },
  { id: 'tr2', name: 'NSCLC Targeted Therapy Trial', conditions: ['Lung Cancer'], city: 'Chicago', country: 'United States', phase: 'Phase III', status: 'Recruiting', contactEmail: 'trial-tr2@ct.org', description: 'Investigating targeted therapy effectiveness in advanced NSCLC.' },
  { id: 'tr3', name: 'Brain Cancer Precision Medicine', conditions: ['Brain Cancer'], city: 'London', country: 'United Kingdom', phase: 'Phase I', status: 'Active', contactEmail: 'trial-tr3@ct.org', description: 'Precision medicine approach for primary brain tumors.' },
  { id: 'tr4', name: 'Completed Glioma Study', conditions: ['Glioma'], city: 'Toronto', country: 'Canada', phase: 'Completed', status: 'Completed' },
];

export const PUBLICATIONS: Publication[] = [
  { id: 'pub1', title: 'Latest Advances in Glioma Treatment', conditions: ['Glioma', 'Brain Cancer'], year: 2025, url: 'https://example.org/pub1', abstract: 'An overview of cutting-edge therapies in glioma.' },
  { id: 'pub2', title: 'Targeted Therapies in Lung Cancer', conditions: ['Lung Cancer'], year: 2024, url: 'https://example.org/pub2', abstract: 'Review of targeted therapies for NSCLC.' },
  { id: 'pub3', title: 'Integrative Care for Brain Tumors', conditions: ['Brain Cancer'], year: 2023, url: 'https://example.org/pub3', abstract: 'Integrative approaches in brain tumor management.' },
  { id: 'pub4', title: 'Breast Cancer Outcomes 2022', conditions: ['Breast Cancer'], year: 2022, url: 'https://example.org/pub4' },
];
