import { NextRequest, NextResponse } from 'next/server';
import sanityClient from '@sanity/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { client } from '@/sanity/lib/client';

const authenticateAdmin = async (email: string, password: string) => {
  try {
    const query = `*[_type == "admin" && email == $email]`;
    const params = { email };
    const admin = await client.fetch(query, params);

    if (admin.length === 0) {
      throw new Error('No admin found with this email');
    }

    const adminData = admin[0];

    // Compare the hashed password
    const isPasswordValid = (adminData.password === password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return adminData;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const admin = await authenticateAdmin(email, password);

    // Generate a JWT token
    const token = jwt.sign(
      { email: admin.email, role: admin.role },
      'NxcFKrlHrzKu6sa6BE5Kpo1ku-oQgmyjQ3dN_HRBSdnUZhh-Ee5_53tdW0tH4LTp', 
      { expiresIn: '1d' }
    );

    

    const response = NextResponse.json({ message: 'Login successful' , admin: admin });

    // Set the token in a cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true, // Prevent client-side JavaScript access
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 60 * 60 * 24, // 1 day
      path: '/', // Accessible on the entire site
    });

    return response;

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Authentication failed' }, { status: 401 });
  }
}
