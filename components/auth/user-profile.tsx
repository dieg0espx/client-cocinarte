'use client'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, User } from 'lucide-react'
import SignOutButton from './sign-out-button'

export default function UserProfile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Avatar className="w-16 h-16 mx-auto mb-4">
          <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span className="text-sm">
              {user.email_confirmed_at ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
        
        <SignOutButton />
      </CardContent>
    </Card>
  )
}
