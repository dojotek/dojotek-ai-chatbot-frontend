"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useChatSessionsControllerFindOne } from "@/sdk/chat-sessions/chat-sessions";
import { useChatAgentsControllerFindOne } from "@/sdk/chat-agents/chat-agents";
import { useCustomerStaffsControllerFindOne } from "@/sdk/customer-staffs/customer-staffs";
import { useCustomersControllerFindOne } from "@/sdk/customers/customers";
import { useChatMessagesControllerFindAll } from "@/sdk/chat-messages/chat-messages";

// data loaded from SDK hooks below

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
  const params = useParams<{ id: string }>();
  const chatSessionId = params?.id as string;

  // session
  const { data: sessionResp } = useChatSessionsControllerFindOne(chatSessionId ?? "", {});
  const session = sessionResp?.data;

  // related entities
  const { data: agentResp } = useChatAgentsControllerFindOne(session?.chatAgentId ?? "", {});
  const agent = agentResp?.data;
  const { data: staffResp } = useCustomerStaffsControllerFindOne(session?.customerStaffId ?? "", {});
  const staff = staffResp?.data;
  const { data: customerResp } = useCustomersControllerFindOne(staff?.customerId ?? "", {});
  const customer = customerResp?.data;

  // messages
  const { data: messagesResp } = useChatMessagesControllerFindAll({ skip: 0, take: 1000, search: "", chatSessionId: chatSessionId ?? "", messageType: "" });
  const messages = (messagesResp?.data ?? []).slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

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

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/chat-sessions"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Session Details</h1>
      </div>

      {/* Session Details */}
      <div className="rounded-md border bg-white p-8 md:p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">CUSTOMER</dt>
            <dd className="text-sm">{customer?.name ?? '-'}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">CUSTOMER STAFF</dt>
            <dd className="text-sm">{staff?.name ?? '-'}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">CHATBOT</dt>
            <dd className="text-sm">{agent?.name ?? '-'}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">CHANNEL</dt>
            <dd className="text-sm">{session?.platform ?? '-'}</dd>
          </div>
          <div className="space-y-1 md:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">INITIATED AT</dt>
            <dd className="text-sm">{session?.createdAt ? formatTimestamp(new Date(session.createdAt)) : '-'}</dd>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Chat Messages</h2>
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.messageType === 'user' ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] space-y-1 ${
                  message.messageType === 'user' ? "order-2" : "order-1"
                }`}
              >
                {/* Role label outside the balloon */}
                <div
                  className={`text-sm font-semibold tracking-wide text-muted-foreground ${
                    message.messageType === 'user' ? "text-right" : "text-left"
                  }`}
                >
                  {message.messageType === 'user' ? 'HUMAN' : 'AI'}
                </div>
                <div
                  className={`inline-block rounded-3xl py-2 px-4 text-sm ${
                    message.messageType === 'user'
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                <div
                  className={`text-xs text-muted-foreground ${
                    message.messageType === 'user' ? "text-right" : "text-left"
                  }`}
                >
                  {formatMessageTime(new Date(message.createdAt))}
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