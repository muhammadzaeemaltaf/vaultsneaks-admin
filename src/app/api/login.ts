import { NextRequest, NextResponse } from 'next/server';
import sanityClient from '@sanity/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const client = sanityClient({
  projectId: 'your_project_id',
  dataset: 'your_dataset',
  useCdn: false,
});

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
    const isPasswordValid = await bcrypt.compare(password, adminData.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return adminData;
  } catch (error) {
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
      'your-secret-key', // Replace with your actual secret
      { expiresIn: '1d' }
    );

    // Respond with the token
    return NextResponse.json({ message: 'Login successful', token });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Authentication failed' }, { status: 401 });
  }
}
