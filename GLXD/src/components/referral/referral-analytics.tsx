'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TrendingUp, Clock, Users, Award, Calendar } from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalReferrals: number
    completedReferrals: number
    conversionRate: number
    avgConversionTime: number
  }
  monthlyData: Array<{
    month: string
    count: number
    total_earnings: number
  }>
  statusStats: Array<{
    status: string
    _count: { status: number }
    _sum: { commission: number | null; bonus: number | null }
  }>
  topReferrals: Array<{
    id: string
    commission: number
    bonus: number
    referred: {
      name: string
      email: string
      createdAt: string
    }
  }>
}

export function ReferralAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/referral/analytics')
      const result = await response.json()
      
      if (result.success) {
        setData(result.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý'
      case 'CONFIRMED':
        return 'Đã xác nhận'
      case 'COMPLETED':
        return 'Hoàn thành'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return status
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lỗi tải dữ liệu</CardTitle>
          <CardDescription>
            Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giới thiệu</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số thành viên được giới thiệu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.conversionRate.toFixed(1)}%</div>
            <Progress value={data.overview.conversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian chuyển đổi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.avgConversionTime} ngày</div>
            <p className="text-xs text-muted-foreground">
              Trung bình để hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.completedReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Giới thiệu thành công
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất theo tháng</CardTitle>
          <CardDescription>
            Số lượng giới thiệu và thu nhập theo từng tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyData.length > 0 ? (
              data.monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatMonth(month.month)}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{month.count}</div>
                      <div className="text-xs text-muted-foreground">Giới thiệu</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(month.total_earnings)}
                      </div>
                      <div className="text-xs text-muted-foreground">Thu nhập</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có dữ liệu theo tháng
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân phối trạng thái</CardTitle>
          <CardDescription>
            Thống kê theo trạng thái của các giới thiệu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.statusStats.map((stat, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{getStatusLabel(stat.status)}</span>
                  <Badge variant={
                    stat.status === 'COMPLETED' ? 'default' :
                    stat.status === 'PENDING' ? 'secondary' :
                    stat.status === 'CONFIRMED' ? 'outline' : 'destructive'
                  }>
                    {stat._count.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Tổng: {formatCurrency((stat._sum.commission || 0) + (stat._sum.bonus || 0))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Giới thiệu hiệu quả nhất</CardTitle>
          <CardDescription>
            Top 5 giới thiệu có giá trị cao nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.topReferrals.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thành viên</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead>Hoa hồng</TableHead>
                    <TableHead>Thưởng</TableHead>
                    <TableHead className="text-right">Tổng cộng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(referral.referred.name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {referral.referred.name || 'Không có tên'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {referral.referred.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(referral.referred.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(referral.commission)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(referral.bonus)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(referral.commission + referral.bonus)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có giới thiệu nào
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}