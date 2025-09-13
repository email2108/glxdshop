'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, Share2, Gift } from 'lucide-react'

interface ReferralLinkGeneratorProps {
  onGenerate: () => Promise<{ referralCode: string; referralLink: string }>
}

export function ReferralLinkGenerator({ onGenerate }: ReferralLinkGeneratorProps) {
  const [referralData, setReferralData] = useState<{ referralCode: string; referralLink: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const data = await onGenerate()
      setReferralData(data)
    } catch (error) {
      console.error('Error generating referral link:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (referralData) {
      await navigator.clipboard.writeText(referralData.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (referralData && navigator.share) {
      try {
        await navigator.share({
          title: 'Tham gia GLXĐ Shop',
          text: 'Hãy tham gia GLXĐ Shop qua link giới thiệu của tôi!',
          url: referralData.referralLink
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Link giới thiệu
        </CardTitle>
        <CardDescription>
          Tạo link giới thiệu của bạn để mời thành viên mới tham gia GLXĐ Shop
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!referralData ? (
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Đang tạo...' : 'Tạo link giới thiệu'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã giới thiệu của bạn</label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {referralData.referralCode}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Link giới thiệu</label>
              <div className="flex gap-2">
                <Input 
                  value={referralData.referralLink} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">Đã sao chép link!</p>
              )}
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Thưởng giới thiệu</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 10,000 VNĐ hoa hồng cho mỗi thành viên mới</li>
                <li>• 5,000 VNĐ thưởng thêm khi thành viên hoạt động</li>
                <li>• Tổng thưởng: 15,000 VNĐ / giới thiệu thành công</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}