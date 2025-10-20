import { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../stores/authStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export const Dashboard = () => {
  const { user, fetchUser } = useAuthStore();

  useEffect(() => {
    // Fetch user data on mount to ensure it's up to date
    fetchUser().catch((error: Error) => {
      // Error handled by interceptor
      console.error('Failed to fetch user:', error.message);
    });
  }, [fetchUser]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Here's what's happening with your account today.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-lg">{user?.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-lg capitalize">{user?.role}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Overview of your activity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-gray-500">Total Activities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">No recent activity</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};