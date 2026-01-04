import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'
import { CreateDonationForm } from '@/components/create-donation-form'

export default async function AdminDonationsPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Get all donations
  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      *,
      profiles (
        id,
        email
      ),
      campaigns (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get all campaigns for the form
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('status', 'active')
    .order('name')

  // Get all users for the form
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email')
    .order('email')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost">← Back to Admin</Button>
              </Link>
              <h1 className="text-xl font-semibold">Manage Donations</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Donations</h2>
          <p className="text-gray-600">View and manage all donations</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            {donations && donations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No donations yet.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Donations</CardTitle>
                  <CardDescription>Recent donations across all campaigns</CardDescription>
                </CardHeader>
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
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Campaign
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {donations?.map((donation: any) => (
                          <tr key={donation.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(donation.created_at).toLocaleDateString('uk-UA', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₴{Number(donation.amount).toLocaleString('uk-UA')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {donation.profiles?.email || donation.user_id.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {donation.campaigns?.name || donation.campaign_id.slice(0, 8)}...
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
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Donation</CardTitle>
                <CardDescription>Manually record a donation</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateDonationForm
                  campaigns={campaigns || []}
                  users={profiles || []}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
