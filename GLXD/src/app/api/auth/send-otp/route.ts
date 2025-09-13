import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, phone, type } = await request.json()
    
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email hoặc số điện thoại là bắt buộc' },
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
    
    // Với REGISTRATION, user không được tồn tại
    if (type === 'REGISTRATION' && user) {
      return NextResponse.json(
        { error: 'Tài khoản đã tồn tại' },
        { status: 400 }
      )
    }
    
    // Với LOGIN và ADMIN_LOGIN, user phải tồn tại
    if ((type === 'LOGIN' || type === 'ADMIN_LOGIN') && !user) {
      return NextResponse.json(
        { error: 'Tài khoản không tồn tại' },
        { status: 404 }
      )
    }
    
    // Kiểm tra role cho ADMIN_LOGIN
    if (type === 'ADMIN_LOGIN' && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập admin' },
        { status: 403 }
      )
    }
    
    // Tạo OTP code (6 digits)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    
    // Cập nhật OTP cho user
    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: {
          otpCode,
          otpExpiry
        }
      })
    }
    
    // Lưu OTP log
    await db.otpLog.create({
      data: {
        userId: user?.id || 'pending',
        otpCode,
        type: type as any,
        purpose: type === 'REGISTRATION' ? 'User registration' : 
                type === 'LOGIN' ? 'User login' : 'Admin login'
      }
    })
    
    // Trong môi trường thực tế, bạn sẽ gửi OTP qua email hoặc SMS
    // Ở đây chúng ta chỉ log ra console để test
    console.log(`OTP for ${email || phone}: ${otpCode}`)
    
    // Mock gửi OTP - trong thực tế bạn sẽ tích hợp với dịch vụ gửi email/SMS
    const mockSend = async () => {
      if (email) {
        console.log(`Sending OTP to email: ${email}`)
        // await sendEmail(email, 'Your OTP Code', `Your OTP is: ${otpCode}`)
      }
      if (phone) {
        console.log(`Sending OTP to phone: ${phone}`)
        // await sendSMS(phone, `Your OTP is: ${otpCode}`)
      }
    }
    
    await mockSend()
    
    return NextResponse.json({
      success: true,
      message: 'OTP đã được gửi',
      // Chỉ trả về OTP trong môi trường development để test
      otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
    })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}