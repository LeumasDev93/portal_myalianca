import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('Request received at:', new Date().toISOString());
  
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user');
  console.log('User ID:', userId);

  if (!userId) {
    console.error('user_id is missing');
    return NextResponse.json(
      { error: 'user_id is required' },
      { status: 400 }
    );
  }

   const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/profile?user_id=${userId}`;
    const apiToken = process.env.API_SECRET_TOKEN;
      try {
        console.log('Fetching from API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
          'Authorization': `Bearer ${apiToken}`,
          'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '' 
          }
        });

    console.log('API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log('API data received:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in route handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data', details: error },
      { status: 500 }
    );
  }
}