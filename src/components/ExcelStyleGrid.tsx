'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface DataRow {
  id: number;
  company_name: string;
  fiscal_month: string;
  category1: string;
  category2: string | null;
  category3: string | null;
  amount: number;
  notes: string | null;
  [key: string]: any;
}

interface ExcelStyleGridProps {
  data: DataRow[];
  onDataChange: () => void;
  onDelete?: (id: number) => void;
}

// カテゴリの階層関係データ
const CATEGORY_HIERARCHY = {
  "売上高": {
    "派遣業": [],
    "警備業": []
  },
  "製造原価": {
    "派遣人件費": [],
    "警備人件費": [],
    "法定福利費": [],
    "福利厚生費": [],
    "経費": [
      "派遣旅費交通費",
      "警備旅費交通費", 
      "広告宣伝費",
      "消耗品費",
      "支払手数料",
      "研修費",
      "その他"
    ]
  },
  "販売費・一般管理費": {
    "給与手当": [],
    "賞与繰入": [],
    "法定福利費": [],
    "福利厚生費": [],
    "雑給": [],
    "社員研修費": [],
    "経費": [
      "通勤交通費",
      "広告宣伝費",
      "支払手数料",
      "リース料",
      "水道光熱費",
      "車両関連費",
      "事務用品・消耗品費",
      "支払保険料",
      "修繕費",
      "減価償却費",
      "接待交際費",
      "旅費交通費",
      "通信費",
      "地代家賃",
      "会議費",
      "諸会費"
    ],
    "報酬手当": [],
    "本部負担金": []
  },
  "営業外収益": {
    "受取利息": [],
    "受取配当金": [],
    "賃貸収入": [],
    "雑収入": []
  },
  "営業外費用": {
    "支払利息": [],
    "有価証券手数料": [],
    "賃貸減価償却費": [],
    "賃貸租税公課": []
  }
};

const ExcelStyleGrid: React.FC<ExcelStyleGridProps> = ({ data, onDataChange, onDelete }) => {
  // Client-side only state - prevents hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    column: string;
    value: any;
  } | null>(null);
  const [gridData, setGridData] = useState<DataRow[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // カテゴリー選択オプション用の状態
  const [category2Options, setCategory2Options] = useState<string[]>([]);
  const [category3Options, setCategory3Options] = useState<string[]>([]);

  // This effect runs only on the client after initial hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // データを取得時に会計月のフォーマットを確認・修正
    const formattedData = data.map(row => {
      let formattedRow = { ...row };
      
      // 会計月のフォーマットをYYYY/MMに統一
      if (row.fiscal_month) {
        // スラッシュでスプリット
        const parts = row.fiscal_month.split('/');
        if (parts.length >= 2) {
          const year = parts[0];
          const month = parts[1].padStart(2, '0'); // 2桁にする
          formattedRow.fiscal_month = `${year}/${month}`;
        }
      }
      
      return formattedRow;
    });
    
    setGridData(formattedData);
  }, [data, isClient]);

  // Focus on input when editing starts - only on client
  useEffect(() => {
    if (!isClient || !editingCell) return;

    if (editingCell.column === 'category1' || editingCell.column === 'category2' || editingCell.column === 'category3') {
      // セレクトボックスにフォーカス
      selectRef.current?.focus();
    } else {
      // 通常の入力フィールドにフォーカス
      inputRef.current?.focus();
    }
  }, [editingCell, isClient]);

  // カテゴリ1に応じたカテゴリ2のオプションを更新
  useEffect(() => {
    if (!isClient || !editingCell) return;
    
    if (editingCell.column === 'category2' && editingCell.rowId) {
      const row = gridData.find(r => r.id === editingCell.rowId);
      if (row && row.category1) {
        const options = row.category1 in CATEGORY_HIERARCHY ? Object.keys(CATEGORY_HIERARCHY[row.category1]) : [];
        setCategory2Options(options);
      }
    }
  }, [editingCell, gridData, isClient]);

  // カテゴリ1と2に応じたカテゴリ3のオプションを更新
  useEffect(() => {
    if (!isClient || !editingCell) return;
    
    if (editingCell.column === 'category3' && editingCell.rowId) {
      const row = gridData.find(r => r.id === editingCell.rowId);
      if (row && row.category1 && row.category2) {
        const cat1Options = CATEGORY_HIERARCHY[row.category1] || {};
        const options = cat1Options[row.category2] || [];
        setCategory3Options(options);
      }
    }
  }, [editingCell, gridData, isClient]);

  // 選択したカテゴリのバリデーションを行う
  const validateCategorySelection = (rowId: number, column: string, value: string) => {
    if (!value) return true; // 空の値はOK
    
    const row = gridData.find(r => r.id === rowId);
    if (!row) return false;

    // カテゴリ1のバリデーション
    if (column === 'category1') {
      return Object.keys(CATEGORY_HIERARCHY).includes(value);
    }
    
    // カテゴリ2のバリデーション
    if (column === 'category2') {
      if (!row.category1) return false;
      return Object.keys(CATEGORY_HIERARCHY[row.category1] || {}).includes(value);
    }
    
    // カテゴリ3のバリデーション
    if (column === 'category3') {
      if (!row.category1 || !row.category2) return false;
      const options = CATEGORY_HIERARCHY[row.category1]?.[row.category2] || [];
      return options.includes(value);
    }
    
    return true;
  };

  // カテゴリの依存関係に基づいて他のカテゴリをリセット
  const resetDependentCategories = (rowId: number, column: string, value: string) => {
    const updatedData = [...gridData];
    const rowIndex = updatedData.findIndex(r => r.id === rowId);
    
    if (rowIndex === -1) return updatedData;
    
    if (column === 'category1') {
      // カテゴリ1が変更されたら、カテゴリ2と3をリセット
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        category1: value,
        category2: null,
        category3: null
      };
    } else if (column === 'category2') {
      // カテゴリ2が変更されたら、カテゴリ3をリセット
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        category2: value,
        category3: null
      };
    } else if (column === 'category3') {
      // カテゴリ3のみ変更
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        category3: value
      };
    }
    
    return updatedData;
  };

  // Handle clicking on a cell to start editing
  const handleCellClick = (rowId: number, column: string, value: any) => {
    if (!isClient) return;
    
    // Don't allow editing the ID column
    if (column === 'id') return;

    // カテゴリー2の選択時、カテゴリー1に基づく選択肢を設定
    if (column === 'category2') {
      const row = gridData.find(r => r.id === rowId);
      if (!row || !row.category1) {
        alert('カテゴリ2を選択する前に、カテゴリ1を選択してください');
        return;
      }
      
      const options = row.category1 in CATEGORY_HIERARCHY ? Object.keys(CATEGORY_HIERARCHY[row.category1]) : [];
      setCategory2Options(options);
      
      if (options.length === 0) {
        alert('選択したカテゴリ1には、関連するカテゴリ2がありません');
        return;
      }
    }
    
    // カテゴリー3の選択時、カテゴリー1と2に基づく選択肢を設定
    if (column === 'category3') {
      const row = gridData.find(r => r.id === rowId);
      if (!row || !row.category1 || !row.category2) {
        alert('カテゴリ3を選択する前に、カテゴリ1とカテゴリ2を選択してください');
        return;
      }
      
      const cat1Options = CATEGORY_HIERARCHY[row.category1] || {};
      const options = cat1Options[row.category2] || [];
      setCategory3Options(options);
      
      if (options.length === 0) {
        alert('選択したカテゴリ1とカテゴリ2の組み合わせには、関連するカテゴリ3がありません');
        return;
      }
    }
    
    setEditingCell({
      rowId,
      column,
      value: value !== null ? value : '',
    });
  };

  // Handle input change during editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!isClient || !editingCell) return;
    
    const { value } = e.target;
    const { rowId, column } = editingCell;
    
    // カテゴリの選択が有効かどうかをチェック
    if ((column === 'category1' || column === 'category2' || column === 'category3') && value) {
      if (!validateCategorySelection(rowId, column, value)) {
        alert('無効なカテゴリ選択です');
        return;
      }
    }
    
    setEditingCell({
      ...editingCell,
      value: value,
    });
    
    // カテゴリの依存関係に基づいて他のカテゴリをリセット
    if (column === 'category1' || column === 'category2' || column === 'category3') {
      const updatedData = resetDependentCategories(rowId, column, value);
      setGridData(updatedData);
    }
  };

  // Handle key presses during editing (for navigation and submission)
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!isClient || !editingCell) return;

    // Handle special keys
    if (e.key === 'Escape') {
      // Cancel editing
      setEditingCell(null);
    } else if (e.key === 'Enter') {
      // Submit changes
      await saveChanges();
    } else if (e.key === 'Tab') {
      // Move to next/previous cell
      e.preventDefault();
      await saveChanges();
      
      // Find current column index
      const columns = getVisibleColumns();
      const currentColIndex = columns.indexOf(editingCell.column);
      const currentRowIndex = gridData.findIndex(row => row.id === editingCell.rowId);
      
      // Determine next cell based on shift key
      if (e.shiftKey) {
        // Move to previous cell
        if (currentColIndex > 0) {
          // Previous column in same row
          const prevColumn = columns[currentColIndex - 1];
          // Skip the id column
          if (prevColumn !== 'id') {
            const currentRow = gridData.find(row => row.id === editingCell.rowId);
            handleCellClick(editingCell.rowId, prevColumn, currentRow?.[prevColumn]);
          }
        } else if (currentRowIndex > 0) {
          // Last column in previous row
          const prevRow = gridData[currentRowIndex - 1];
          const lastColumn = columns[columns.length - 1];
          handleCellClick(prevRow.id, lastColumn, prevRow[lastColumn]);
        }
      } else {
        // Move to next cell
        if (currentColIndex < columns.length - 1) {
          // Next column in same row
          const nextColumn = columns[currentColIndex + 1];
          // Skip the id column
          if (nextColumn !== 'id') {
            const currentRow = gridData.find(row => row.id === editingCell.rowId);
            handleCellClick(editingCell.rowId, nextColumn, currentRow?.[nextColumn]);
          }
        } else if (currentRowIndex < gridData.length - 1) {
          // First column in next row
          const nextRow = gridData[currentRowIndex + 1];
          // Skip the id column
          const firstEditableColumn = columns[0] === 'id' ? columns[1] : columns[0];
          handleCellClick(nextRow.id, firstEditableColumn, nextRow[firstEditableColumn]);
        }
      }
    }
  };

  // Handle saving changes to the database
  const saveChanges = async () => {
    if (!isClient || !editingCell) return;
    
    try {
      const { rowId, column, value } = editingCell;
      let processedValue = value;
      
      // 会計月のフォーマットチェック
      if (column === 'fiscal_month') {
        // YYYY/MM形式に統一
        const fiscalMonthPattern = /^(\d{4})\/(\d{1,2})$/;
        const match = value.match(fiscalMonthPattern);
        
        if (!match) {
          alert('会計月は YYYY/MM 形式で入力してください');
          return;
        }
        
        // 2桁にパディング
        const year = match[1];
        const month = match[2].padStart(2, '0');
        processedValue = `${year}/${month}`;
      }
      
      // 金額の処理
      if (column === 'amount' && value !== '') {
        processedValue = parseFloat(value);
        if (isNaN(processedValue)) {
          alert('金額には有効な数値を入力してください');
          return;
        }
      }
      
      // 空の値を null に変換
      if (value === '' && (column === 'category2' || column === 'category3' || column === 'notes')) {
        processedValue = null;
      }
      
      // カテゴリのバリデーション
      if ((column === 'category1' || column === 'category2' || column === 'category3') && processedValue) {
        if (!validateCategorySelection(rowId, column, processedValue)) {
          alert(`選択された${getColumnDisplayName(column)}は無効です`);
          return;
        }
      }
      
      // カテゴリの依存関係に基づいて他のカテゴリをリセット
      let updateData: Record<string, any> = {};
      
      if (column === 'category1') {
        updateData = {
          category1: processedValue,
          category2: null,
          category3: null
        };
      } else if (column === 'category2') {
        updateData = {
          category2: processedValue,
          category3: null
        };
      } else {
        updateData = { [column]: processedValue };
      }
      
      // Update the local data first for immediate feedback
      const updatedData = gridData.map(row => {
        if (row.id === rowId) {
          return { ...row, ...updateData };
        }
        return row;
      });
      setGridData(updatedData);
      
      // Update the database
      const { error } = await supabase
        .from('financial_data')
        .update(updateData)
        .eq('id', rowId);
      
      if (error) {
        console.error('Error updating data:', error);
        alert(`更新エラー: ${error.message}`);
        // Revert to original data on error
        setGridData(data);
        return;
      }
      
      // Notify parent component of data change
      onDataChange();
    } catch (err) {
      console.error('Error saving changes:', err);
      alert('データの更新中にエラーが発生しました');
      // Revert to original data on error
      setGridData(data);
    } finally {
      // Clear editing state
      setEditingCell(null);
    }
  };

  // Handle clicking outside the editing cell to save changes
  const handleBlur = () => {
    saveChanges();
  };

  // Get visible columns (columns to display in the grid)
  const getVisibleColumns = (): string[] => {
    if (gridData.length === 0) return [];
    // Customize this list to control which columns are visible and their order
    return ['id', 'company_name', 'fiscal_month', 'category1', 'category2', 'category3', 'amount', 'notes'];
  };

  // Get friendly column name for display
  const getColumnDisplayName = (column: string): string => {
    const displayNames: Record<string, string> = {
      id: 'ID',
      company_name: '会社名',
      fiscal_month: '会計月',
      category1: 'カテゴリ1',
      category2: 'カテゴリ2',
      category3: 'カテゴリ3',
      amount: '金額',
      notes: '備考',
    };
    return displayNames[column] || column;
  };

  // Get cell content based on column type
  const getCellContent = (value: any, column: string): React.ReactNode => {
    if (value === null || value === undefined) return '';
    
    if (column === 'amount') {
      return `¥${value.toLocaleString()}`;
    }
    
    return value.toString();
  };

  // カテゴリや会計月のセルを描画する
  const renderCell = (row: DataRow, column: string) => {
    // 編集中のセルかどうか
    const isEditing = editingCell && editingCell.rowId === row.id && editingCell.column === column;
    
    if (isEditing) {
      // カテゴリーのセレクトボックス
      if (column === 'category1') {
        return (
          <select
            ref={selectRef}
            value={editingCell.value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full p-1 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {Object.keys(CATEGORY_HIERARCHY).map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }
      
      if (column === 'category2') {
        return (
          <select
            ref={selectRef}
            value={editingCell.value || ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full p-1 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {category2Options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }
      
      if (column === 'category3') {
        return (
          <select
            ref={selectRef}
            value={editingCell.value || ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full p-1 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={category3Options.length === 0}
          >
            <option value="">選択してください</option>
            {category3Options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }
      
      // 会計月の入力フィールド
      if (column === 'fiscal_month') {
        return (
          <input
            ref={inputRef}
            type="text"
            value={editingCell.value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="YYYY/MM"
            className="w-full p-1 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      }
      
      // その他の入力フィールド
      return (
        <input
          ref={inputRef}
          type={column === 'amount' ? 'number' : 'text'}
          value={editingCell.value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full p-1 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }
    
    // 通常時のセル表示
    return (
      <div className="text-sm text-gray-900">
        {getCellContent(row[column], column)}
      </div>
    );
  };

  // カテゴリが編集可能かどうかを判断する
  const isCategoryEditable = (row: DataRow, column: string) => {
    // カテゴリ1は常に編集可能
    if (column === 'category1') return true;
    
    // カテゴリ2はカテゴリ1が選択されている場合のみ編集可能
    if (column === 'category2') {
      return !!row.category1;
    }
    
    // カテゴリ3はカテゴリ1と2が選択されていて、選択肢がある場合のみ編集可能
    if (column === 'category3') {
      if (!row.category1 || !row.category2) return false;
      
      const options = 
        CATEGORY_HIERARCHY[row.category1]?.[row.category2] || [];
      
      return options.length > 0;
    }
    
    return true;
  };

  // Don't render anything meaningful during SSR to avoid hydration issues
  if (!isClient) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID', '会社名', '会計月', 'カテゴリ1', 'カテゴリ2', 'カテゴリ3', '金額', '備考', 'アクション'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              <td colSpan={9} className="px-4 py-4 text-center text-sm text-gray-500">
                Loading...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {getVisibleColumns().map(column => (
              <th
                key={column}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                {getColumnDisplayName(column)}
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              アクション
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {gridData.length > 0 ? (
            gridData.map(row => (
              <tr key={row.id} className="hover:bg-blue-50">
                {getVisibleColumns().map(column => {
                  // セルが編集可能かどうか判断
                  const isEditable = column !== 'id' && isCategoryEditable(row, column);
                  
                  return (
                    <td
                      key={`${row.id}-${column}`}
                      className={`px-4 py-2 whitespace-nowrap 
                        ${isEditable ? 'cursor-pointer hover:bg-gray-100' : ''}
                        ${!isEditable && column !== 'id' ? 'opacity-50' : ''}
                      `}
                      onClick={() => isEditable && handleCellClick(row.id, column, row[column])}
                      title={!isEditable && column !== 'id' ? '先に親カテゴリを選択してください' : ''}
                    >
                      {renderCell(row, column)}
                    </td>
                  );
                })}
                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      if (window.confirm('このデータを削除してもよろしいですか？')) {
                        onDelete && onDelete(row.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={getVisibleColumns().length + 1}
                className="px-4 py-4 text-center text-sm text-gray-500"
              >
                データがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelStyleGrid;