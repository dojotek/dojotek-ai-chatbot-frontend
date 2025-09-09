import { Users, Bot, MessageSquare, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Chatbots",
      value: "12",
      change: "+2 this month",
      icon: Bot,
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+12% from last month",
      icon: Users,
    },
    {
      title: "Messages Today",
      value: "5,678",
      change: "+8% from yesterday",
      icon: MessageSquare,
    },
    {
      title: "Response Rate",
      value: "94.2%",
      change: "+2.1% from last week",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Dojotek AI Chatbot admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="p-6 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors">
              Create New Chatbot
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors">
              Add Knowledge Base
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors">
              Configure Channel
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors">
              View Analytics
            </button>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">New chatbot &quot;Customer Support&quot; created</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Knowledge base updated with 15 new articles</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Slack channel integration completed</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">User permissions updated for 3 staff members</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
