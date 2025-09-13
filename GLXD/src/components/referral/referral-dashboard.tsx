'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReferralStats } from '@/components/referral/referral-stats'
import { ReferralLinkGenerator } from '@/components/referral/referral-link-generator'
import { ReferralList } from '@/components/referral/referral-list'
import { EarningsList } from '@/components/referral/earnings-list'
import { ReferralAnalytics } from '@/components/referral/referral-analytics'
import { OtpVerification } from '@/components/auth/otp-verification'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, Gift, DollarSign, BarChart3, LogOut, User, Award } from 'lucide-react'

interface Referral {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  commission: number
  bonus: number
  createdAt: string
  referred: {
    id: string
    name: string
    email: string
    createdAt: string
  }
}

interface Earning {
  id: string
  type: 'REFERRAL_BONUS' | 'ACTIVITY_BONUS' | 'MILESTONE_BONUS'
  amount: number
  description?: string
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'
  createdAt: string
}

interface ReferralData {
  stats: {
    referrals: {
      total: number
      pending: number
      confirmed: number
      completed: number
    }
    earnings: {
      total: number
      pending: number
      approved: number
      paid: number
    }
  }
  referrals: Referral[]
  earnings: Earning[]
}

interface User {
  id: string
  email?: string
  phone?: string
  name?: string
  role: 'ADMIN' | 'MEMBER' | 'MODERATOR'
  isVerified: boolean
}

export function ReferralDashboard() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    // Check if user is authenticated (in real app, check session/token)
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        if (parsedUser.role === 'ADMIN') {
          fetchData()
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setLoading(false)
  }

  const fetchData = async () => {
    try {
      const response = await fetch('/api/referral/stats')
      const result = await response.json()
      
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    }
  }

  const handleGenerateReferralLink = async () => {
    const response = await fetch('/api/referral/generate', {
      method: 'POST'
    })
    const result = await response.json()
    
    if (result.success) {
      return {
        referralCode: result.user.referralCode,
        referralLink: result.referralLink
      }
    }
    throw new Error(result.error || 'Failed to generate referral link')
  }

  const handleUserVerified = (userData: any) => {
    const newUser = userData.user || userData
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    
    if (newUser.role === 'ADMIN') {
      fetchData()
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    setData(null)
  }

  const handleLogin = (type: 'LOGIN' | 'ADMIN_LOGIN') => {
    setAuthLoading(true)
    // In a real app, you would show a modal or navigate to login page
    setTimeout(() => {
      setAuthLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">GLXĐ Shop</h1>
            <p className="text-muted-foreground">Hệ thống giới thiệu L2M</p>
          </div>
          
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="register" className="mt-6">
              <OtpVerification 
                type="REGISTRATION" 
                onVerified={handleUserVerified}
              />
            </TabsContent>
            
            <TabsContent value="login" className="mt-6">
              <OtpVerification 
                type="LOGIN" 
                onVerified={handleUserVerified}
              />
            </TabsContent>
            
            <TabsContent value="admin" className="mt-6">
              <OtpVerification 
                type="ADMIN_LOGIN" 
                onVerified={handleUserVerified}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Regular user dashboard (only referral features)
  if (user.role === 'MEMBER') {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Hệ thống giới thiệu L2M</h1>
            <p className="text-muted-foreground">
              Chào {user.name || user.email || user.phone}! Quản lý hệ thống giới thiệu của bạn
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              <User className="inline h-4 w-4 mr-1" />
              {user.role}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="referrals">Giới thiệu</TabsTrigger>
            <TabsTrigger value="earnings">Thu nhập</TabsTrigger>
            <TabsTrigger value="tools">Công cụ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chào mừng đến với GLXĐ Shop!</CardTitle>
                <CardDescription>
                  Bắt đầu giới thiệu bạn bè để nhận thưởng ngay hôm nay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <Gift className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">10,000 VNĐ</h3>
                    <p className="text-sm text-muted-foreground">Hoa hồng giới thiệu</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">5,000 VNĐ</h3>
                    <p className="text-sm text-muted-foreground">Thưởng thêm</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">15,000 VNĐ</h3>
                    <p className="text-sm text-muted-foreground">Tổng thưởng</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách giới thiệu</CardTitle>
                <CardDescription>
                  Theo dõi các thành viên bạn đã giới thiệu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có dữ liệu giới thiệu
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử thu nhập</CardTitle>
                <CardDescription>
                  Theo dõi các khoản thu nhập của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có thu nhập
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <ReferralLinkGenerator onGenerate={handleGenerateReferralLink} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Admin dashboard (full features including analytics)
  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Đang tải dữ liệu...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Hệ thống giới thiệu L2M</h1>
          <p className="text-muted-foreground">
            Chào Admin {user.name || user.email || user.phone}! Quản lý hệ thống giới thiệu của GLXĐ Shop
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            <User className="inline h-4 w-4 mr-1" />
            {user.role}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Giới thiệu
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Thu nhập
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Phân tích
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Công cụ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ReferralStats stats={data.stats} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <ReferralList referrals={data.referrals.slice(0, 5)} />
            <EarningsList earnings={data.earnings.slice(0, 5)} />
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <ReferralList referrals={data.referrals} />
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <EarningsList earnings={data.earnings} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ReferralAnalytics />
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <ReferralLinkGenerator onGenerate={handleGenerateReferralLink} />
          
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn giới thiệu</CardTitle>
              <CardDescription>
                Cách thức giới thiệu thành viên mới và nhận thưởng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Bước 1: Tạo link</h3>
                  <p className="text-sm text-muted-foreground">
                    Tạo link giới thiệu cá nhân của bạn
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Bước 2: Chia sẻ</h3>
                  <p className="text-sm text-muted-foreground">
                    Chia sẻ link với bạn bè và người thân
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Bước 3: Nhận thưởng</h3>
                  <p className="text-sm text-muted-foreground">
                    Nhận thưởng khi thành viên mới tham gia
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Chính sách thưởng</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 10,000 VNĐ hoa hồng cho mỗi thành viên mới đăng ký thành công</li>
                  <li>• 5,000 VNĐ thưởng thêm khi thành viên mới có hoạt động</li>
                  <li>• Tổng thưởng tối đa: 15,000 VNĐ / giới thiệu thành công</li>
                  <li>• Thưởng sẽ được duyệt và thanh toán hàng tháng</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}