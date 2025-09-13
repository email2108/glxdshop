'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, TrendingUp, Award } from 'lucide-react'

interface ReferralStatsProps {
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
}

export function ReferralStats({ stats }: ReferralStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng giới thiệu</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.referrals.total}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{stats.referrals.pending} chờ</Badge>
            <Badge variant="default">{stats.referrals.confirmed} xác nhận</Badge>
            <Badge variant="outline">{stats.referrals.completed} hoàn thành</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.earnings.total)}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{formatCurrency(stats.earnings.pending)} chờ</Badge>
            <Badge variant="default">{formatCurrency(stats.earnings.approved)} duyệt</Badge>
            <Badge variant="outline">{formatCurrency(stats.earnings.paid)} đã trả</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.referrals.total > 0 
              ? Math.round((stats.referrals.completed / stats.referrals.total) * 100)
              : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.referrals.completed} / {stats.referrals.total} hoàn thành
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Thưởng trung bình</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.referrals.total > 0 
              ? formatCurrency(stats.earnings.total / stats.referrals.total)
              : formatCurrency(0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Mỗi giới thiệu thành công
          </p>
        </CardContent>
      </Card>
    </div>
  )
}