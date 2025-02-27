 'use client';

import React, { useState, useEffect } from 'react';

// ブラウザ専用機能を安全に処理するシンプルなクライアントコンポーネント
const ClientComponent = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSRの間はなにも表示せず、ハイドレーション問題を回避
  if (!mounted) {
    return null;
  }

  return (
    <div>
      <p>クライアント側のコンポーネントが正常に読み込まれました</p>
    </div>
  );
};

export default ClientComponent;