import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, phone, otpCode, type } = await request.json()
    
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email hoặc số điện thoại là bắt buộc' },
        { status: 400 }
      )
    }
    
    if (!otpCode) {
      return NextResponse.json(
        { error: 'Mã OTP là bắt buộc' },
        { status: 400 }
      )
    }
    
    if (!type || !['REGISTRATION', 'LOGIN', 'ADMIN_LOGIN'].includes(type)) {
      return NextResponse.json(
        { error: 'Loại OTP không hợp lệ' },
        { status: 400 }
      )
    }
    
    // Tìm user bằng email hoặc phone
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
    
    // Kiểm tra role cho ADMIN_LOGIN
    if (type === 'ADMIN_LOGIN' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập admin' },
        { status: 403 }
      )
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
    
    // Xóa OTP sau khi verify
    await db.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiry: null,
        isVerified: true
      }
    })
    
    // Tạo session token (đơn giản cho demo)
    const sessionToken = randomBytes(32).toString('hex')
    
    // Cập nhật user với session token
    await db.user.update({
      where: { id: user.id },
      data: {
        // Trong thực tế bạn sẽ lưu session token vào bảng sessions riêng
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Xác thực OTP thành công',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified
      },
      sessionToken
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}