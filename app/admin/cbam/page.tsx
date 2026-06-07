import AdminCbamClient from './client';

export const metadata = {
  title: 'CBAM 基線確認 — Carbon Lens 碳排鏡菱',
  robots: { index: false, follow: false },
};

export default function AdminCbamPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AdminCbamClient />
      </div>
    </main>
  );
}
