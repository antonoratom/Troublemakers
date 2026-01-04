import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    const { campaign_id, user_id, amount, status } = body

    if (!campaign_id || !user_id || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, current_amount')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create donation
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        campaign_id,
        user_id,
        amount,
        status: status || 'completed',
      })
      .select()
      .single()

    if (donationError) {
      console.error('Donation creation error:', donationError)
      return NextResponse.json(
        { error: 'Failed to create donation' },
        { status: 500 }
      )
    }

    // Update campaign current_amount
    const newAmount = Number(campaign.current_amount) + Number(amount)
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ current_amount: newAmount })
      .eq('id', campaign_id)

    if (updateError) {
      console.error('Campaign update error:', updateError)
      // Don't fail the request if update fails, but log it
    }

    // Ensure user is a campaign member
    const { data: existingMember } = await supabase
      .from('campaign_members')
      .select('*')
      .eq('campaign_id', campaign_id)
      .eq('user_id', user_id)
      .single()

    if (!existingMember) {
      await supabase
        .from('campaign_members')
        .insert({
          campaign_id,
          user_id,
          role: 'member',
        })
    }

    return NextResponse.json({ donation }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/donations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
