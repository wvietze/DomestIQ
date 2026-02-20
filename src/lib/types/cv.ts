// -----------------------------------------------------------------------------
// CV Types — matches worker_cv_data table
// -----------------------------------------------------------------------------

export type WorkHistoryEntry = {
  employer: string;
  role: string;
  start_date: string; // YYYY-MM
  end_date: string | null; // YYYY-MM or null for current
  description: string;
};

export type EducationEntry = {
  institution: string;
  qualification: string;
  year: number;
};

export type WorkerCvData = {
  id: string;
  worker_id: string;
  work_history: WorkHistoryEntry[];
  education: EducationEntry[];
  skills: string[];
  languages: string[];
  personal_statement: string | null;
  created_at: string;
  updated_at: string;
};

// Assembled CV data for rendering (combines CV data + profile data)
export type CvRenderData = {
  full_name: string;
  phone: string;
  email: string;
  suburb?: string;
  city?: string;
  services: string[];
  years_experience?: number;
  work_history: WorkHistoryEntry[];
  education: EducationEntry[];
  skills: string[];
  languages: string[];
  personal_statement: string | null;
  top_traits?: Record<string, number>;
  rating?: number;
  review_count?: number;
};
