import { redirect } from 'next/navigation'
import { requireAuth, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardPage() {
  await requireAuth()
  const profile = await getProfile()
  const supabase = await createClient()

  // Get user's total donations
  const { data: totalDonations, error: donationsError } = await supabase
    .from('user_total_donations')
    .select('total_amount')
    .eq('user_id', profile?.id)
    .single()

  // Get campaigns user is a member of
  const { data: campaignMembers, error: membersError } = await supabase
    .from('campaign_members')
    .select(`
      campaign_id,
      campaigns (
        id,
        name,
        description,
        target_amount,
        current_amount,
        status,
        created_at
      )
    `)
    .eq('user_id', profile?.id)

  const campaigns = campaignMembers?.map((cm: any) => cm.campaigns).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              {profile?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline">Admin Panel</Button>
                </Link>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hey, welcome back!</h2>
          <p className="text-gray-600">Your fundraising overview in total amount</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Raised</CardTitle>
              <CardDescription>Your personal contribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalDonations?.total_amount 
                  ? `₴${Number(totalDonations.total_amount).toLocaleString('uk-UA')}`
                  : '₴0'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current campaigns</CardTitle>
              <CardDescription>Campaigns you are part of right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {campaigns.filter((c: any) => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4">All Your Campaigns</h3>
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                You are not part of any campaigns yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign: any) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {campaign.target_amount > 0
                            ? Math.round((campaign.current_amount / campaign.target_amount) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${campaign.target_amount > 0
                              ? Math.min((campaign.current_amount / campaign.target_amount) * 100, 100)
                              : 0}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₴{Number(campaign.current_amount).toLocaleString('uk-UA')}</span>
                        <span>₴{Number(campaign.target_amount).toLocaleString('uk-UA')}</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/campaigns/${campaign.id}`}>
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
