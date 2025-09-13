'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, User } from 'lucide-react'

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

interface ReferralListProps {
  referrals: Referral[]
}

export function ReferralList({ referrals }: ReferralListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Chờ xử lý</Badge>
      case 'CONFIRMED':
        return <Badge variant="default">Đã xác nhận</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-500 hover:bg-green-600">Hoàn thành</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  if (referrals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giới thiệu</CardTitle>
          <CardDescription>
            Bạn chưa có giới thiệu nào. Hãy chia sẻ link giới thiệu của bạn!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Chưa có thành viên được giới thiệu</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách giới thiệu</CardTitle>
        <CardDescription>
          Theo dõi trạng thái của các thành viên bạn đã giới thiệu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thành viên</TableHead>
                <TableHead>Ngày giới thiệu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hoa hồng</TableHead>
                <TableHead>Thưởng</TableHead>
                <TableHead className="text-right">Tổng cộng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
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
                        {formatDate(referral.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(referral.status)}
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
      </CardContent>
    </Card>
  )
}