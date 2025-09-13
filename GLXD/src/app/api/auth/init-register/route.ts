import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, phone, referralCode } = await request.json()
    
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email hoặc số điện thoại là bắt buộc' },
        { status: 400 }
      )
    }
    
    // Kiểm tra user đã tồn tại chưa
    let existingUser = null
    if (email) {
      existingUser = await db.user.findUnique({
        where: { email }
      })
    } else if (phone) {
      existingUser = await db.user.findUnique({
        where: { phone }
      })
    }
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Tài khoản đã tồn tại' },
        { status: 400 }
      )
    }
    
    // Kiểm tra referral code nếu có
    if (referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode }
      })
      
      if (!referrer) {
        return NextResponse.json(
          { error: 'Mã giới thiệu không hợp lệ' },
          { status: 400 }
        )
      }
    }
    
    // Tạo user tạm thời với status PENDING
    const tempUserId = randomBytes(16).toString('hex')
    const tempUser = await db.user.create({
      data: {
        id: tempUserId,
        email: email || null,
        phone: phone || null,
        role: 'MEMBER',
        status: 'PENDING',
        isVerified: false
      }
    })
    
    // Tạo OTP code (6 digits)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    
    // Cập nhật OTP cho user
    await db.user.update({
      where: { id: tempUser.id },
      data: {
        otpCode,
        otpExpiry
      }
    })
    
    // Lưu OTP log
    await db.otpLog.create({
      data: {
        userId: tempUser.id,
        otpCode,
        type: 'REGISTRATION',
        purpose: 'User registration'
      }
    })
    
    // Mock gửi OTP
    console.log(`Registration OTP for ${email || phone}: ${otpCode}`)
    
    return NextResponse.json({
      success: true,
      message: 'OTP đã được gửi để xác thực đăng ký',
      userId: tempUser.id,
      // Chỉ trả về OTP trong môi trường development để test
      otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
    })
  } catch (error) {
    console.error('Error in init registration:', error)
    return NextResponse.json(
      { error: 'Failed to initiate registration' },
      { status: 500 }
    )
  }
}