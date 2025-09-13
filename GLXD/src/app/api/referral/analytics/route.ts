import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // For now, let's use a simple user ID for testing
    // In a real app, you would get this from the session
    const userId = "test-user-id"
    
    // Get user's referrals with detailed analytics
    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Get monthly referral data
    const monthlyData = await db.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as count,
        SUM(commission + bonus) as total_earnings
      FROM referrals 
      WHERE referrerId = ${userId}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
      LIMIT 12
    ` as Array<{ month: string; count: number; total_earnings: number }>
    
    // Get referral conversion rates by status
    const statusStats = await db.referral.groupBy({
      by: ['status'],
      where: { referrerId: userId },
      _count: { status: true },
      _sum: { commission: true, bonus: true }
    })
    
    // Get top performing referrals (by earnings)
    const topReferrals = await db.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { commission: 'desc' },
        { bonus: 'desc' }
      ],
      take: 5
    })
    
    // Calculate average time to conversion
    const completedReferrals = await db.referral.findMany({
      where: { 
        referrerId: userId,
        status: 'COMPLETED'
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })
    
    const avgConversionTime = completedReferrals.length > 0
      ? completedReferrals.reduce((sum, ref) => {
          const time = new Date(ref.updatedAt).getTime() - new Date(ref.createdAt).getTime()
          return sum + time
        }, 0) / completedReferrals.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0
    
    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalReferrals: referrals.length,
          completedReferrals: completedReferrals.length,
          conversionRate: referrals.length > 0 
            ? (completedReferrals.length / referrals.length) * 100 
            : 0,
          avgConversionTime: Math.round(avgConversionTime)
        },
        monthlyData,
        statusStats,
        topReferrals
      }
    })
  } catch (error) {
    console.error('Error fetching referral analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral analytics' },
      { status: 500 }
    )
  }
}