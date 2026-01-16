// Admin routes now redirect to /dashboard where role-based content is displayed
// This layout just passes through children for the redirect page
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
