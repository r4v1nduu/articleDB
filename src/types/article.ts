export interface Article {
  id: string;
  product: string;
  subject: string;
  body: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleCreate {
  product: string;
  subject: string;
  body: string;
  date: string;
}

export interface ArticleUpdate {
  product?: string;
  subject?: string;
  body?: string;
  date?: string;
}

export interface SearchResult {
  id: string;
  product: string;
  subject: string;
  body: string;
  date: string;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
  query: string;
  engine?: "mongodb";
}

export interface SearchRequest {
  q: string;
  size?: number;
}
