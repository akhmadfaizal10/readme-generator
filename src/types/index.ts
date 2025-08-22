export interface Repository {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  languages_url: string;
  topics: string[];
  license: {
    name: string;
    spdx_id: string;
  } | null;
  default_branch: string;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
}

export interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
}

export interface TechnologyStack {
  languages: Record<string, number>;
  frameworks: string[];
  tools: string[];
  databases: string[];
  deployment: string[];
}

export interface ReadmeSection {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
  order: number;
}

export interface ReadmeTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReadmeSection[];
}