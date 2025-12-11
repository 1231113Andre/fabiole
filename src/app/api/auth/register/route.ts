import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, initializeSheet } from '@/lib/googleSheets';
import { RegisterData } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    // Initialize sheet headers if needed
    await initializeSheet();

    const body: RegisterData = await request.json();
    const { email, password, name, phone } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await createUser({
      email,
      password,
      name,
      phone,
    });

    // Don't send password back in response
    const { password: _, ...userResponse } = newUser;

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userResponse 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

