import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { referralCode, email, name, password } = await request.json()
    
    if (!referralCode || !email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Tìm user có referral code
    const referrer = await db.user.findUnique({
      where: { referralCode }
    })
    
    if (!referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      )
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Tạo user mới
    const newUser = await db.user.create({
      data: {
        id: randomBytes(16).toString('hex'),
        email,
        name,
        referrerId: referrer.id,
        role: 'MEMBER',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      }
    })
    
    // Tạo referral record
    await db.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: newUser.id,
        status: 'PENDING',
        commission: 10000, // 10,000 VNĐ
        bonus: 5000 // 5,000 VNĐ thưởng thêm
      }
    })
    
    // Tạo earning cho referrer
    await db.earning.create({
      data: {
        userId: referrer.id,
        type: 'REFERRAL_BONUS',
        amount: 15000, // Tổng thưởng
        description: `Referral bonus for ${newUser.name}`,
        status: 'PENDING'
      }
    })
    
    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Registration successful! Welcome to GLXĐ Shop.'
    })
  } catch (error) {
    console.error('Error in referral registration:', error)
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}