import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'
import { CreateCampaignForm } from '@/components/create-campaign-form'

export default async function AdminCampaignsPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Get all campaigns
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  // Get campaign progress for each
  const campaignsWithProgress = await Promise.all(
    (campaigns || []).map(async (campaign) => {
      const { data: progress } = await supabase
        .from('campaign_progress')
        .select('*')
        .eq('campaign_id', campaign.id)
        .single()

      return {
        ...campaign,
        progress: progress?.current_amount || campaign.current_amount,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost">← Back to Admin</Button>
              </Link>
              <h1 className="text-xl font-semibold">Manage Campaigns</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline">User Dashboard</Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h2>
          <p className="text-gray-600">Create and manage fundraising campaigns</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            {campaignsWithProgress.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No campaigns yet. Create your first campaign below.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {campaignsWithProgress.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{campaign.name}</CardTitle>
                          <CardDescription>{campaign.description}</CardDescription>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            campaign.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">
                              ₴{Number(campaign.progress).toLocaleString('uk-UA')} / ₴
                              {Number(campaign.target_amount).toLocaleString('uk-UA')}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${campaign.target_amount > 0
                                  ? Math.min((campaign.progress / campaign.target_amount) * 100, 100)
                                  : 0}%`,
                              }}
                            />
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {campaign.target_amount > 0
                              ? Math.round((campaign.progress / campaign.target_amount) * 100)
                              : 0}% complete
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/campaigns/${campaign.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
                <CardDescription>Start a new fundraising campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateCampaignForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
