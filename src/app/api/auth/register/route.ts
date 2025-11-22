import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword, fullName, preferredName } = body;
    if (!email || !password || !confirmPassword || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    // Hash password
    const hashedPassword = await hashPassword(password);
    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: fullName,
        // role omitted, uses @default(FREE)
      },
    });
    // Generate JWT token
    // import { generateToken } from '@/lib/auth' at the top if not already
    const token = require("@/lib/auth").generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
