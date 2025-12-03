'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export default function Header({ user }: { user: any }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b px-4 lg:px-8 flex items-center gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="search" placeholder="Search members, payments..." className="pl-9 h-10" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-2">
              <h3 className="font-semibold mb-2">Notifications</h3>
              <div className="space-y-2">
                <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <p className="text-sm font-medium">5 memberships expiring this week</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <p className="text-sm font-medium">New lead: John Doe</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
                <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <p className="text-sm font-medium">Payment received: ₹5,000</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
