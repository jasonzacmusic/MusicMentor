import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from './auth-provider';
import { signInWithGoogle, signOutUser } from '@/lib/firebase';

export function AuthButton() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={signInWithGoogle}
        className="text-blue-600 hover:bg-blue-50"
        data-testid="button-signin"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1" data-testid="button-user-menu">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-3 py-2 border-b">
          <p className="font-medium text-sm" data-testid="text-username">
            {user.displayName || 'User'}
          </p>
          <p className="text-xs text-gray-500" data-testid="text-email">
            {user.email}
          </p>
        </div>
        <DropdownMenuItem 
          onClick={signOutUser}
          className="text-red-600 cursor-pointer"
          data-testid="button-signout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}