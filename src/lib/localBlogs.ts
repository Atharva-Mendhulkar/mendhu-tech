export interface LocalPost {
  title:             string;
  slug:              string;
  brief:             string;
  publishedAt:       string;
  updatedAt:         string;
  readTimeInMinutes: number;
  content:           string;
  tags:              { name: string }[];
  series?:           { name: string; slug: string } | null;
}

export const localBlogs: LocalPost[] = [];
