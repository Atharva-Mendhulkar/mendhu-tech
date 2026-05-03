const HASHNODE_QUERY = `
  query {
    publication(host: "atharvarta.hashnode.dev") {
      posts(first: 2) {
        edges {
          node {
            title
            brief
            publishedAt
            tags { name }
            readTimeInMinutes
            slug
          }
        }
      }
    }
  }
`;

export interface Post {
  title: string;
  brief: string;
  publishedAt: string;
  tags: { name: string }[];
  readTimeInMinutes: number;
  slug: string;
}

export async function getLatestPosts(): Promise<Post[]> {
  try {
    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': '0cb3d74f-1448-421d-b181-962fd449b69e'
      },
      body: JSON.stringify({ query: HASHNODE_QUERY }),
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    const json = await response.json();
    const fetchedPosts = json.data?.publication?.posts?.edges?.map((e: any) => e.node) || [];
    
    // Filter for featured tags specifically
    const featured = fetchedPosts.filter((p: any) => 
      p.tags?.some((t: any) => t.name.toLowerCase() === 'featured')
    );

    if (featured.length > 0) {
      return featured.slice(0, 2);
    }
    
    return fetchedPosts.slice(0, 2);
  } catch (err) {
    console.error('Error fetching Hashnode posts:', err);
    return [];
  }
}
