import { NextResponse } from 'next/server';

const HASHNODE_GQL_ENDPOINT = 'https://gql.hashnode.com';
const HASHNODE_TOKEN = '0cb3d74f-1448-421d-b181-962fd449b69e';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(HASHNODE_GQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': HASHNODE_TOKEN,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying Hashnode request:', error);
    return NextResponse.json({ error: 'Failed to fetch from Hashnode' }, { status: 500 });
  }
}
