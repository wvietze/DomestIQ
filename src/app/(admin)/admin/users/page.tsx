'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: string
  avatar_url: string | null
  created_at: string
  popi_consent: boolean
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true)
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
      }

      const { data } = await query
      setUsers((data || []) as UserProfile[])
      setIsLoading(false)
    }
    loadUsers()
  }, [supabase, page, roleFilter, searchQuery])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(0) }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'worker', 'client', 'admin'].map(role => (
            <Button
              key={role}
              variant={roleFilter === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setRoleFilter(role); setPage(0) }}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{user.full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.full_name || 'Unnamed'}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email || user.phone || 'No contact'}
                  </p>
                </div>
                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'worker' ? 'secondary' : 'outline'}>
                  {user.role}
                </Badge>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page + 1}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={users.length < pageSize}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
