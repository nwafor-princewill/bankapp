// bank-dis/app/api/crypto/transactions/route.ts

import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) { // Use NextRequest to access headers
  try {
    // **FIX:** Get the Authorization header from the INCOMING request
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    // **FIX:** Forward the header to the backend
    const response = await fetch('https://bank-backend-eagz.onrender.com/api/crypto/transactions', {
      headers: {
        'Authorization': authHeader, // Pass the header along
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in Next.js transactions proxy:", error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions via proxy' },
      { status: 500 }
    );
  }
}