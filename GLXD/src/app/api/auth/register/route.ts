import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, phone, name, otpCode, referralCode } = await request.json()
    
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email hoặc số điện thoại là bắt buộc' },
        { status: 400 }
      )
    }
    
    if (!name) {
      return NextResponse.json(
        { error: 'Họ và tên là bắt buộc' },
        { status: 400 }
      )
    }
    
    if (!otpCode) {
      return NextResponse.json(
        { error: 'Mã OTP là bắt buộc' },
        { status: 400 }
      )
    }
    
    // Tìm user bằng email hoặc phone để verify OTP
    let user = null
    if (email) {
      user = await db.user.findUnique({
        where: { email }
      })
    } else if (phone) {
      user = await db.user.findUnique({
        where: { phone }
      })
    }
    
    // Kiểm tra OTP
    if (!user || user.otpCode !== otpCode) {
      return NextResponse.json(
        { error: 'Mã OTP không chính xác' },
        { status: 400 }
      )
    }
    
    // Kiểm tra OTP expiry
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return NextResponse.json(
        { error: 'Mã OTP đã hết hạn' },
        { status: 400 }
      )
    }
    
    // Xử lý referral code nếu có
    let referrer = null
    if (referralCode) {
      referrer = await db.user.findUnique({
        where: { referralCode }
      })
      
      if (!referrer) {
        return NextResponse.json(
          { error: 'Mã giới thiệu không hợp lệ' },
          { status: 400 }
        )
      }
    }
    
    // Cập nhật thông tin user
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name,
        referrerId: referrer?.id,
        isVerified: true,
        otpCode: null,
        otpExpiry: null
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    })
    
    // Tạo referral record nếu có referrer
    if (referrer) {
      await db.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: updatedUser.id,
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
          description: `Referral bonus for ${updatedUser.name}`,
          status: 'PENDING'
        }
      })
    }
    
    // Cập nhật OTP log
    await db.otpLog.updateMany({
      where: {
        userId: user.id,
        otpCode,
        isUsed: false
      },
      data: {
        isUsed: true
      }
    })
    
    // Tạo session token
    const sessionToken = randomBytes(32).toString('hex')
    
    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công!',
      user: updatedUser,
      sessionToken
    })
  } catch (error) {
    console.error('Error in registration:', error)
    return NextResponse.json(
      { error: 'Failed to complete registration' },
      { status: 500 }
    )
  }
}