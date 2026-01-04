import { redirect } from 'next/navigation'
import { requireAuth, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'
import { notFound } from 'next/navigation'

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()
  const profile = await getProfile()
  const supabase = await createClient()

  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', params.id)
    .single()

  if (campaignError || !campaign) {
    notFound()
  }

  // Check if user is a member of this campaign
  const { data: membership } = await supabase
    .from('campaign_members')
    .select('*')
    .eq('campaign_id', params.id)
    .eq('user_id', profile?.id)
    .single()

  // Admins can see all campaigns, but regular users can only see campaigns they're members of
  if (profile?.role !== 'admin' && !membership) {
    redirect('/dashboard')
  }

  // Get campaign progress from view
  const { data: progress } = await supabase
    .from('campaign_progress')
    .select('*')
    .eq('campaign_id', params.id)
    .single()

  // Get goals for this campaign
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('campaign_id', params.id)
    .order('target_amount', { ascending: true })

  // Get user's donations for this campaign
  const { data: userDonations } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', params.id)
    .eq('user_id', profile?.id)
    .order('created_at', { ascending: false })

  const userTotal = userDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">← Back to Dashboard</Button>
              </Link>
              <h1 className="text-xl font-semibold">Campaign Details</h1>
            </div>
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">{campaign.name}</CardTitle>
            <CardDescription>{campaign.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Overall Progress</h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Raised</span>
                  <span className="font-medium">
                    {progress?.current_amount 
                      ? `₴${Number(progress.current_amount).toLocaleString('uk-UA')}`
                      : `₴${Number(campaign.current_amount).toLocaleString('uk-UA')}`}
                    {' / '}
                    ₴{Number(campaign.target_amount).toLocaleString('uk-UA')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{
                      width: `${campaign.target_amount > 0
                        ? Math.min(((progress?.current_amount || campaign.current_amount) / campaign.target_amount) * 100, 100)
                        : 0}%`,
                    }}
                  />
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {campaign.target_amount > 0
                    ? Math.round(((progress?.current_amount || campaign.current_amount) / campaign.target_amount) * 100)
                    : 0}% complete
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Your Contribution</h3>
                <div className="text-2xl font-bold">
                  ₴{userTotal.toLocaleString('uk-UA')}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {userDonations?.length || 0} donation{userDonations?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {goals && goals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Campaign Goals</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => {
                const goalProgress = progress?.current_amount || campaign.current_amount
                const isReached = goalProgress >= goal.target_amount
                return (
                  <Card key={goal.id} className={isReached ? 'border-green-500' : ''}>
                    <CardHeader>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Target</span>
                          <span className="font-medium">
                            ₴{Number(goal.target_amount).toLocaleString('uk-UA')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isReached ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{
                              width: `${Math.min((goalProgress / goal.target_amount) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        {isReached && (
                          <div className="text-sm text-green-600 font-medium">✓ Reached!</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {userDonations && userDonations.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Donations</h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userDonations.map((donation) => (
                        <tr key={donation.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(donation.created_at).toLocaleDateString('uk-UA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₴{Number(donation.amount).toLocaleString('uk-UA')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {donation.status || 'completed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
