'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import MonthlyTrendChart from '@/components/MonthlyTrendChart';
import CategoryChart from '@/components/CategoryChart';

export default function Home() {
  // サンプルデータ
  const [monthlyData, setMonthlyData] = useState([
    { month: '2023/4/1', amount: 69847 },
    { month: '2023/5/1', amount: 70995 },
    { month: '2023/6/1', amount: 78156 }
  ]);

  const [categoryData, setCategoryData] = useState([
    { category: '売上高', value: 96934 },
    { category: '製造原価', value: 86321 },
    { category: '販売費・一般管理費', value: 28737 },
    { category: '営業外収益', value: 4563 },
    { category: '営業外費用', value: 2443 }
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* サイドバー */}
        <div className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">PURITY UI DASHBOARD</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/" className="block p-2 rounded bg-blue-500 text-white">
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link href="/data-management" className="block p-2 rounded hover:bg-gray-100">
                  データ管理
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* メインコンテンツ */}
        <div className="flex-1">
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">ダッシュボード</h2>
            </div>
            <div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                ログイン
              </button>
            </div>
          </header>
          
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">財務データダッシュボード</h1>
            
            {/* サマリーカード */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">今月の売上</p>
                    <h3 className="text-2xl font-bold">¥53,000</h3>
                    <p className="text-sm text-green-500">+55%</p>
                  </div>
                  <div className="bg-teal-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">取引数</p>
                    <h3 className="text-2xl font-bold">2,300</h3>
                    <p className="text-sm text-green-500">+5%</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">カテゴリー数</p>
                    <h3 className="text-2xl font-bold">5</h3>
                    <p className="text-sm text-red-500">-14%</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">総利益</p>
                    <h3 className="text-2xl font-bold">¥173,000</h3>
                    <p className="text-sm text-green-500">+8%</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* グラフエリア */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">月次トレンド</h2>
                <MonthlyTrendChart data={monthlyData} />
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">カテゴリー別金額</h2>
                <CategoryChart data={categoryData} />
              </div>
            </div>
            
            {/* プロジェクト一覧 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">プロジェクト</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left text-sm font-medium text-gray-500">名前</th>
                      <th className="py-3 text-left text-sm font-medium text-gray-500">メンバー</th>
                      <th className="py-3 text-left text-sm font-medium text-gray-500">予算</th>
                      <th className="py-3 text-left text-sm font-medium text-gray-500">進捗</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 1, name: '売上データ分析', members: 5, budget: '¥32,000', completion: 60 },
                      { id: 2, name: '経費管理システム', members: 4, budget: '¥14,000', completion: 100 },
                      { id: 3, name: '予実管理モジュール', members: 2, budget: '¥3,000', completion: 10 },
                      { id: 4, name: 'データ収集ツール', members: 3, budget: '¥400', completion: 25 }
                    ].map((project) => (
                      <tr key={project.id} className="border-b">
                        <td className="py-4">
                          <span className="font-medium">{project.name}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex -space-x-2">
                            {Array(project.members).fill(0).map((_, i) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs">
                                {String.fromCharCode(65 + i)}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4">{project.budget}</td>
                        <td className="py-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                project.completion === 100
                                  ? 'bg-green-500'
                                  : project.completion > 50
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                              }`}
                              style={{ width: `${project.completion}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{project.completion}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}