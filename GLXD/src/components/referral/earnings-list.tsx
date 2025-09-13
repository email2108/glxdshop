'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, DollarSign } from 'lucide-react'

interface Earning {
  id: string
  type: 'REFERRAL_BONUS' | 'ACTIVITY_BONUS' | 'MILESTONE_BONUS'
  amount: number
  description?: string
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'
  createdAt: string
}

interface EarningsListProps {
  earnings: Earning[]
}

export function EarningsList({ earnings }: EarningsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'REFERRAL_BONUS':
        return 'Thưởng giới thiệu'
      case 'ACTIVITY_BONUS':
        return 'Thưởng hoạt động'
      case 'MILESTONE_BONUS':
        return 'Thưởng cột mốc'
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Chờ xử lý</Badge>
      case 'APPROVED':
        return <Badge variant="default">Đã duyệt</Badge>
      case 'PAID':
        return <Badge className="bg-green-500 hover:bg-green-600">Đã trả</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (earnings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thu nhập</CardTitle>
          <CardDescription>
            Bạn chưa có thu nhập nào. Hãy giới thiệu thành viên mới để nhận thưởng!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Chưa có thu nhập</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử thu nhập</CardTitle>
        <CardDescription>
          Theo dõi tất cả các khoản thu nhập của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại thu nhập</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell>
                    <span className="font-medium">
                      {getTypeLabel(earning.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {earning.description || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(earning.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(earning.status)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(earning.amount)}
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