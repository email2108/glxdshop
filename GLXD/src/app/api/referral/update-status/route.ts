import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { referralId, status } = await request.json()
    
    if (!referralId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Update referral status
    const updatedReferral = await db.referral.update({
      where: { id: referralId },
      data: { status },
      include: {
        referrer: true,
        referred: true
      }
    })
    
    // If status is COMPLETED, update earning status to APPROVED
    if (status === 'COMPLETED') {
      await db.earning.updateMany({
        where: {
          userId: updatedReferral.referrerId,
          type: 'REFERRAL_BONUS',
          status: 'PENDING'
        },
        data: { status: 'APPROVED' }
      })
    }
    
    return NextResponse.json({
      success: true,
      referral: updatedReferral
    })
  } catch (error) {
    console.error('Error updating referral status:', error)
    return NextResponse.json(
      { error: 'Failed to update referral status' },
      { status: 500 }
    )
  }
}