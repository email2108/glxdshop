'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Shield, Mail, Phone, Clock, CheckCircle } from 'lucide-react'

interface OtpVerificationProps {
  type: 'REGISTRATION' | 'LOGIN' | 'ADMIN_LOGIN'
  onVerified: (userData: any) => void
  initialData?: {
    email?: string
    phone?: string
    name?: string
    referralCode?: string
  }
}

export function OtpVerification({ type, onVerified, initialData }: OtpVerificationProps) {
  const [step, setStep] = useState<'input' | 'verify'>('input')
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    name: initialData?.name || '',
    referralCode: initialData?.referralCode || ''
  })
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState('')
  const [countdown, setCountdown] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSendOtp = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const endpoint = type === 'REGISTRATION' ? '/api/auth/init-register' : '/api/auth/send-otp'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email || null,
          phone: formData.phone || null,
          type
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setSuccess('OTP đã được gửi!')
      setStep('verify')
      setUserId(data.userId || '')
      startCountdown()
      
      // Show OTP in development
      if (process.env.NODE_ENV === 'development' && data.otp) {
        setSuccess(`OTP đã được gửi! Mã OTP của bạn là: ${data.otp}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    setLoading(true)

    try {
      let endpoint = '/api/auth/verify-otp'
      let payload: any = {
        email: formData.email || null,
        phone: formData.phone || null,
        otpCode,
        type
      }

      // For registration, we need to include additional data
      if (type === 'REGISTRATION') {
        endpoint = '/api/auth/register'
        payload = {
          ...payload,
          name: formData.name,
          referralCode: formData.referralCode || null
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP')
      }

      setSuccess('Xác thực thành công!')
      onVerified(data.user || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const getTypeTitle = () => {
    switch (type) {
      case 'REGISTRATION':
        return 'Đăng ký tài khoản'
      case 'LOGIN':
        return 'Đăng nhập'
      case 'ADMIN_LOGIN':
        return 'Đăng nhập Admin'
      default:
        return 'Xác thực OTP'
    }
  }

  const getTypeDescription = () => {
    switch (type) {
      case 'REGISTRATION':
        return 'Tạo tài khoản mới với xác thực OTP'
      case 'LOGIN':
        return 'Đăng nhập vào tài khoản của bạn'
      case 'ADMIN_LOGIN':
        return 'Đăng nhập vào trang quản trị'
      default:
        return 'Xác thực danh tính của bạn'
    }
  }

  if (success && type !== 'REGISTRATION') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Xác thực thành công!</CardTitle>
          <CardDescription>
            {success}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>{getTypeTitle()}</CardTitle>
        <CardDescription>
          {getTypeDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {step === 'input' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nhap@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">HOẶC</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0912345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            {type === 'REGISTRATION' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Mã giới thiệu (không bắt buộc)</Label>
                  <Input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    placeholder="Nhập mã giới thiệu"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <Button 
              onClick={handleSendOtp} 
              disabled={loading || (!formData.email && !formData.phone)}
              className="w-full"
            >
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Mã OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Nhập 6 số OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                OTP có hiệu lực trong 5 phút
              </span>
              {countdown > 0 ? (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {countdown}s
                </Badge>
              ) : (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  Gửi lại OTP
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleVerifyOtp} 
                disabled={loading || otpCode.length !== 6}
                className="w-full"
              >
                {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setStep('input')}
                className="w-full"
              >
                Quay lại
              </Button>
            </div>
          </div>
        )}

        {type === 'ADMIN_LOGIN' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Lưu ý:</strong> Đây là trang đăng nhập dành cho quản trị viên. 
              Chỉ admin mới có thể truy cập.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}