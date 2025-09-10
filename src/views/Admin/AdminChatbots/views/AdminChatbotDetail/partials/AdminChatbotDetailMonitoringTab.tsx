function AdminChatbotDetailMonitoringTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div className="p-4 rounded-md border bg-background">Uptime & Latency</div>
      <div className="p-4 rounded-md border bg-background">Throughput</div>
      <div className="p-4 rounded-md border bg-background">Errors</div>
      <div className="p-4 rounded-md border bg-background md:col-span-2 xl:col-span-3">Recent Sessions</div>
    </div>
  );
}

export default AdminChatbotDetailMonitoringTab;

