import { redirect } from 'next/navigation'
import { requireAdmin, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'

export default async function AdminPage() {
  await requireAdmin()
  const profile = await getProfile()
  const supabase = await createClient()

  // Get all campaigns
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  // Get all donations
  const { data: donations, error: donationsError } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get total donations across all campaigns
  const { data: totalDonations } = await supabase
    .from('donations')
    .select('amount')

  const totalAmount = totalDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  // Get active campaigns count
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Overview</h2>
          <p className="text-gray-600">Manage campaigns and donations</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Raised</CardTitle>
              <CardDescription>Across all campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₴{totalAmount.toLocaleString('uk-UA')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Campaigns</CardTitle>
              <CardDescription>All campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{campaigns?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Currently running</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCampaigns}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/campaigns">
                <Button className="w-full" variant="outline">
                  Manage Campaigns
                </Button>
              </Link>
              <Link href="/admin/donations">
                <Button className="w-full" variant="outline">
                  Manage Donations
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Latest 10 donations</CardDescription>
            </CardHeader>
            <CardContent>
              {donations && donations.length > 0 ? (
                <div className="space-y-2">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          ₴{Number(donation.amount).toLocaleString('uk-UA')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(donation.created_at).toLocaleDateString('uk-UA')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Campaign: {donation.campaign_id.slice(0, 8)}...
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No donations yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
