import React from 'react';
import { Package, Tag, Users, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Projects',
      value: '24',
      change: '+12%',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Categories',
      value: '8',
      change: '+2',
      icon: Tag,
      color: 'text-green-600',
    },
    {
      title: 'Pending Reviews',
      value: '6',
      change: '+3',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Active Users',
      value: '12',
      change: '+1',
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'AI Chatbot Framework',
      category: 'Development',
      status: 'pending',
      date: '2024-01-15',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 2,
      name: 'MCP Server Directory',
      category: 'Tools',
      status: 'approved',
      date: '2024-01-14',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 3,
      name: 'Code Translation Tool',
      category: 'AI',
      status: 'rejected',
      date: '2024-01-13',
      color: 'bg-red-100 text-red-800',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your 1stlab MCP directory
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Latest projects submitted for review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.color}`}>
                      {project.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common admin tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Review Pending Projects
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;