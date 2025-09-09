import { Bot, Users, MessageSquare, Settings, Shield, Zap } from "lucide-react";

function AdminAbout() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Dojotek AI Chatbot
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive software system to help enterprises build, configure, run, and monitor multiple AI-powered chatbots with RAG capabilities across various communication channels.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">AI-Powered Chatbots</h3>
          </div>
          <p className="text-muted-foreground">
            Build intelligent chatbots powered by advanced LLM and RAG technology for natural conversations.
          </p>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Multi-Channel Support</h3>
          </div>
          <p className="text-muted-foreground">
            Deploy chatbots across Slack, Microsoft Teams, Discord, Telegram, WhatsApp, and more.
          </p>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Enterprise Ready</h3>
          </div>
          <p className="text-muted-foreground">
            Designed for hospitals, insurance companies, e-commerce, legal, and customer support teams.
          </p>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Easy Configuration</h3>
          </div>
          <p className="text-muted-foreground">
            Intuitive admin dashboard for managing chatbots, knowledge bases, and user permissions.
          </p>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Secure & Compliant</h3>
          </div>
          <p className="text-muted-foreground">
            Enterprise-grade security with compliance features for healthcare and legal industries.
          </p>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Real-time Monitoring</h3>
          </div>
          <p className="text-muted-foreground">
            Monitor chatbot performance, user interactions, and analytics in real-time.
          </p>
        </div>
      </div>

      {/* Supported Channels */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Supported Channels</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            "Slack", "Microsoft Teams", "Lark", "Discord", 
            "Telegram", "WhatsApp", "Shopify", "WordPress",
            "Intranet Portal", "Public Website", "Custom API"
          ].map((channel) => (
            <div
              key={channel}
              className="p-4 rounded-lg border border-border bg-card text-center hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium">{channel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Business Verticals */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Target Industries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Hospital / Clinic",
            "Corporate Health Insurance",
            "E-commerce",
            "Legal and Compliance",
            "Sales Enablement",
            "Technical Support",
            "Customer Support",
            "Education"
          ].map((industry) => (
            <div
              key={industry}
              className="p-4 rounded-lg border border-border bg-card text-center hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium">{industry}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Frontend</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Next.js 15 with TypeScript</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>React 19 with React Query</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Tailwind CSS for styling</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>shadcn/ui components</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Responsive mobile-first design</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Real-time chat sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Knowledge base management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Multi-tenant architecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAbout;