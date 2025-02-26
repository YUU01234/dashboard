import React, { useState, useEffect } from 'react';

// 修正前 - ハイドレーションエラーの原因
const windowWidth = window.innerWidth;

// 修正後 - useEffectでクライアント側のみで実行
const [windowWidth, setWindowWidth] = useState(0);

useEffect(() => {
  setWindowWidth(window.innerWidth);
  
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []); 