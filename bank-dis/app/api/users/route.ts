import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://bank-backend-eagz.onrender.com/api/users', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}