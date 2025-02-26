import dynamic from 'next/dynamic';

// クライアントサイドでのみレンダリングされるコンポーネント
const ClientOnlyComponent = dynamic(() => import('../components/ClientComponent'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

function Page() {
  return (
    <div>
      <h1>サーバーサイドでレンダリングされる部分</h1>
      <ClientOnlyComponent />
    </div>
  );
}

export default Page; 