import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Volunteer Fundraising Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Help support Ukrainian volunteer organizations through transparent fundraising campaigns
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
