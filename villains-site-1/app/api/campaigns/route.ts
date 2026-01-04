import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    const { name, description, target_amount, status } = body

    if (!name || !description || target_amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        name,
        description,
        target_amount,
        status: status || 'active',
        current_amount: 0,
      })
      .select()
      .single()

    if (campaignError) {
      console.error('Campaign creation error:', campaignError)
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      )
    }

    // Add creator as campaign member
    const { error: memberError } = await supabase
      .from('campaign_members')
      .insert({
        campaign_id: campaign.id,
        user_id: user.id,
        role: 'admin',
      })

    if (memberError) {
      console.error('Member creation error:', memberError)
      // Don't fail the request if member creation fails
    }

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
