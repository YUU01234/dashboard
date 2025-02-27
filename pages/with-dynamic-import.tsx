'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// クライアントサイドでのみレンダリングされるコンポーネント
const ClientOnlyComponent = dynamic(() => import('../components/ClientComponent'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

function Page() {
  // Client-only state to prevent hydration issues
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      <h1>サーバーサイドでレンダリングされる部分</h1>
      {/* Only render client component after initial mount */}
      {mounted && <ClientOnlyComponent />}
    </div>
  );
}

export default Page;