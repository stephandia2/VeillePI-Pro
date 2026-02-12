import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
    
    if (!BRAVE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'BRAVE_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    const query = request.nextUrl.searchParams.get('q') || 'contrefaçon saisie douane';
    
    // Rate limiting : attendre 2 secondes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(
      `https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(query)}&count=10`,
      {
        headers: {
          'X-Subscription-Token': BRAVE_API_KEY,
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Brave API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      query,
      results: data.results || [],
      count: data.results?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
