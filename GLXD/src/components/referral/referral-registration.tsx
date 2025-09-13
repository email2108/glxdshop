'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Gift, User, Mail, Lock, CheckCircle } from 'lucide-react'

interface ReferralRegistrationProps {
  referralCode?: string
}

export function ReferralRegistration({ referralCode }: ReferralRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/referral/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode: referralCode || '',
          email: formData.email,
          name: formData.name,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký thất bại')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Đăng ký thành công!</CardTitle>
          <CardDescription>
            Chào mừng bạn đến với GLXĐ Shop. Tài khoản của bạn đã được tạo thành công.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => window.location.href = '/'}>
            Đăng nhập ngay
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <Gift className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Tham gia GLXĐ Shop</CardTitle>
        <CardDescription>
          {referralCode 
            ? `Bạn được mời bởi mã giới thiệu: ${referralCode}`
            : 'Tạo tài khoản để tham gia cộng đồng GLXĐ Shop'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nhập họ và tên của bạn"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

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
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Lợi ích khi tham gia</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Tham gia cộng đồng GLXĐ Shop sôi động</li>
            <li>• Nhận thưởng khi giới thiệu thành viên mới</li>
            <li>• Truy cập các ưu đãi độc quyền</li>
            <li>• Kết nối với các thành viên khác</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}