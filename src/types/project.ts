export interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  github_url?: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  readme_content?: string;
  license?: string;
  stars?: number;
  forks?: number;
  language?: string;
  last_commit?: string;
}