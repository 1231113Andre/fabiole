import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, initializeSheet } from '@/lib/googleSheets';
import { LoginData } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    // Initialize sheet headers if needed
    await initializeSheet();

    const body: LoginData = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password (in production, compare hashed passwords)
    // For now, simple comparison - TODO: Implement bcrypt comparison
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Don't send password back in response
    const { password: _, ...userResponse } = user;

    return NextResponse.json(
      { 
        message: 'Login successful',
        user: userResponse 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

