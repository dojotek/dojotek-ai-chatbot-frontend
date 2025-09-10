"use client";

import Link from "next/link";
import { faker } from "@faker-js/faker";

type ChatMessage = {
  id: string;
  type: "HUMAN" | "SYSTEM";
  content: string;
  timestamp: Date;
};

type SessionDetails = {
  id: string;
  customer: string;
  customerStaff: string;
  chatbot: string;
  channel: string;
  initiatedAt: Date;
};

// Generate sample session details
const sampleSessionDetails: SessionDetails = {
  id: faker.string.uuid(),
  customer: faker.company.name(),
  customerStaff: faker.person.fullName(),
  chatbot: faker.commerce.productName(),
  channel: faker.helpers.arrayElement(["Slack", "WhatsApp Business API", "Lark", "Discord", "Telegram"]),
  initiatedAt: faker.date.past({ years: 1 }),
};

// Generate sample chat messages
const sampleChatMessages: ChatMessage[] = (() => {
  const messages: ChatMessage[] = [];
  const messageCount = faker.number.int({ min: 8, max: 15 });
  
  for (let i = 0; i < messageCount; i++) {
    const isHuman = faker.datatype.boolean();
    messages.push({
      id: faker.string.uuid(),
      type: isHuman ? "HUMAN" : "SYSTEM",
      content: isHuman 
        ? faker.lorem.sentences(faker.number.int({ min: 1, max: 3 }))
        : faker.lorem.sentences(faker.number.int({ min: 2, max: 5 })),
      timestamp: faker.date.between({ 
        from: sampleSessionDetails.initiatedAt, 
        to: new Date() 
      }),
    });
  }
  
  return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
})();

function formatTimestamp(date: Date) {
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.toLocaleString("en-US", { day: "2-digit" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${month} ${day}, ${year} - ${time}`;
}

function formatMessageTime(date: Date) {
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function AdminChatSession() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin/dashboards" className="hover:underline">Dashboard</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/admin/chat-sessions" className="hover:underline">Chat Sessions</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Session Details</li>
        </ol>
      </nav>

      {/* Session Details */}
      <div className="rounded-md border bg-white p-8 md:p-8">
        <div className="mb-8 flex items-center gap-3">
          <Link 
            href="/admin/chat-sessions"
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Back to Chat Sessions"
          >
            <svg 
              className="w-4 h-4 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </Link>
          <h2 className="text-lg font-semibold">Session Details</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">CUSTOMER</dt>
            <dd className="text-sm">{sampleSessionDetails.customer}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">CUSTOMER STAFF</dt>
            <dd className="text-sm">{sampleSessionDetails.customerStaff}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">CHATBOT</dt>
            <dd className="text-sm">{sampleSessionDetails.chatbot}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">CHANNEL</dt>
            <dd className="text-sm">{sampleSessionDetails.channel}</dd>
          </div>
          <div className="space-y-1 md:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">INITIATED AT</dt>
            <dd className="text-sm">{formatTimestamp(sampleSessionDetails.initiatedAt)}</dd>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Chat Messages</h2>
        <div className="space-y-3">
          {sampleChatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "HUMAN" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] space-y-1 ${
                  message.type === "HUMAN" ? "order-2" : "order-1"
                }`}
              >
                <div
                  className={`inline-block rounded-lg p-8 text-sm ${
                    message.type === "HUMAN"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="mb-1 text-xs font-medium opacity-75">
                    {message.type}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                <div
                  className={`text-xs text-muted-foreground ${
                    message.type === "HUMAN" ? "text-right" : "text-left"
                  }`}
                >
                  {formatMessageTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminChatSession;