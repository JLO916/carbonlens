import AdminLeadsClient from './client';

export const metadata = {
  title: '線索管理 — CarbonLens',
  robots: { index: false, follow: false },
};

export default function AdminLeadsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AdminLeadsClient />
      </div>
    </main>
  );
}
