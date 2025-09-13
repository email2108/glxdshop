import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // For now, let's use a simple user ID for testing
    // In a real app, you would get this from the session
    const userId = "test-user-id"
    
    // Get user's referrals
    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Get user's earnings
    const earnings = await db.earning.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    
    // Calculate stats
    const totalReferrals = referrals.length
    const pendingReferrals = referrals.filter(r => r.status === 'PENDING').length
    const confirmedReferrals = referrals.filter(r => r.status === 'CONFIRMED').length
    const completedReferrals = referrals.filter(r => r.status === 'COMPLETED').length
    
    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0)
    const pendingEarnings = earnings
      .filter(e => e.status === 'PENDING')
      .reduce((sum, earning) => sum + earning.amount, 0)
    const approvedEarnings = earnings
      .filter(e => e.status === 'APPROVED')
      .reduce((sum, earning) => sum + earning.amount, 0)
    const paidEarnings = earnings
      .filter(e => e.status === 'PAID')
      .reduce((sum, earning) => sum + earning.amount, 0)
    
    return NextResponse.json({
      success: true,
      stats: {
        referrals: {
          total: totalReferrals,
          pending: pendingReferrals,
          confirmed: confirmedReferrals,
          completed: completedReferrals
        },
        earnings: {
          total: totalEarnings,
          pending: pendingEarnings,
          approved: approvedEarnings,
          paid: paidEarnings
        }
      },
      referrals,
      earnings
    })
  } catch (error) {
    console.error('Error fetching referral stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    )
  }
}