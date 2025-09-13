import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST() {
  try {
    // For now, let's use a simple user ID for testing
    // In a real app, you would get this from the session
    const userId = "test-user-id"
    
    // Tạo referral code ngẫu nhiên
    const referralCode = randomBytes(4).toString('hex').toUpperCase()
    
    // Update user với referral code
    const user = await db.user.update({
      where: { id: userId },
      data: { referralCode },
      select: {
        id: true,
        email: true,
        name: true,
        referralCode: true
      }
    })
    
    return NextResponse.json({
      success: true,
      user,
      referralLink: `https://glxd.shop/ref/${referralCode}`
    })
  } catch (error) {
    console.error('Error generating referral code:', error)
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 }
    )
  }
}