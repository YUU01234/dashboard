'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import DataEntryForm from '@/components/DataEntryForm';
import { useRef } from 'react';
import Papa from 'papaparse';

export default function DataManagement() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingCell, setEditingCell] = useState<{id: number, field: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .order('fiscal_month', { ascending: false });
        
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportLoading(true);
    
    try {
      const text = await readFileAsText(file);
      
      // Papaparse でCSVをパース
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.data && results.data.length > 0) {
            // データ形式を整える
            const formattedData = results.data.map(row => ({
              company_name: row.company_name || 'Default Company',
              fiscal_month: row.fiscal_month || '',
              category1: row.category1 || '',
              category2: row.category2 || null,
              category3: row.category3 || null,
              amount: parseFloat(row.amount) || 0,
              notes: row.notes || null,
              updated_at: new Date().toISOString()
            }));
            
            // Supabaseにデータをインサート
            const { error } = await supabase
              .from('financial_data')
              .insert(formattedData);
              
            if (error) {
              console.error('インポートエラー:', error);
              alert(`インポートエラー: ${error.message}`);
              return;
            }
            
            // データを再取得
            fetchData();
            alert(`${formattedData.length}件のデータをインポートしました`);
          }
        },
        error: (error) => {
          console.error('CSV解析エラー:', error);
          alert('CSVファイルの解析に失敗しました');
        }
      });
    } catch (error) {
      console.error('ファイル読み込みエラー:', error);
      alert('ファイルの読み込みに失敗しました');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file, 'utf-8');
    });
  };
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('financial_data')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchData();
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };
  const startEditing = (id: number, field: string, value: any) => {
    setEditingCell({ id, field });
    setEditValue(value?.toString() || '');
  };
  
  const saveEdit = async () => {
    if (!editingCell) return;
    
    try {
      const { id, field } = editingCell;
      let value = editValue;
      
      // 数値の場合は型変換
      if (field === 'amount') {
        value = parseFloat(editValue);
        if (isNaN(value)) {
          alert('有効な数値を入力してください');
          return;
        }
      }
      
      // Supabaseでデータを更新
      const { error } = await supabase
        .from('financial_data')
        .update({ [field]: value })
        .eq('id', id);
        
      if (error) {
        console.error('更新エラー:', error);
        alert(`更新エラー: ${error.message}`);
        return;
      }
      
      // 編集状態をリセット
      setEditingCell(null);
      
      // データを再取得
      fetchData();
      
    } catch (error) {
      console.error('データ更新エラー:', error);
      alert('データの更新に失敗しました');
    }
  };

  const exportCsv = () => {
    if (data.length === 0) return;
    
    // BOMを追加して文字化けを防止
    const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
    
    const headers = Object.keys(data[0]).join(',');
    const csvRows = data.map(row => {
      return Object.values(row).map(value => {
        // nullや空の値を処理
        if (value === null || value === undefined) return '';
        // 文字列に変換し、カンマやダブルクォートをエスケープ
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',');
    });
    
    const csvContent = [headers, ...csvRows].join('\n');
    
    // BOMとCSVデータを結合
    const blob = new Blob([BOM, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* サイドバー */}
        <div className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">PURITY UI DASHBOARD</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/" className="block p-2 rounded hover:bg-gray-100">
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link href="/data-management" className="block p-2 rounded bg-blue-500 text-white">
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
              <h2 className="text-lg font-semibold">データ管理</h2>
            </div>
            <div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                ログイン
              </button>
            </div>
          </header>
          
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">データ管理</h1>
            
            {/* データ入力フォーム */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">データ入力</h2>
              <DataEntryForm onSuccess={fetchData} />
            </div>
            
            {/* データ一覧 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">データ一覧</h2>
                <div className="flex space-x-2">
                <button 
                    onClick={exportCsv}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    CSVエクスポート
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <button 
                    onClick={handleImportClick}
                    disabled={importLoading}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
                  >
                    {importLoading ? '処理中...' : 'CSVインポート'}
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          会社名
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          会計月
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          カテゴリ1
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          カテゴリ2
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          金額
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.length > 0 ? (
                        data.map((row) => (
                          <tr key={row.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{row.company_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{row.fiscal_month}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{row.category1}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{row.category2}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">¥{row.amount?.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDelete(row.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                削除
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            データがありません
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}