'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface DataEntryFormProps {
  onSuccess: () => void;
}

interface FormData {
  company_name: string;
  fiscal_month: string;
  category1: string;
  category2: string;
  category3: string;
  amount: string;
  notes: string;
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

const DataEntryForm = ({ onSuccess }: DataEntryFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    company_name: 'Default Company',
    fiscal_month: '',
    category1: '',
    category2: '',
    category3: '',
    amount: '',
    notes: '',
  });
  
  const [category2Options, setCategory2Options] = useState<string[]>([]);
  const [category3Options, setCategory3Options] = useState<string[]>([]);
  const [isCategory3Disabled, setIsCategory3Disabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カテゴリ1を選択したときにカテゴリ2のオプションを更新
  useEffect(() => {
    if (formData.category1 && CATEGORY_HIERARCHY[formData.category1]) {
      const cat2Options = Object.keys(CATEGORY_HIERARCHY[formData.category1]);
      setCategory2Options(cat2Options);
      // カテゴリ2をリセット
      setFormData(prev => ({
        ...prev,
        category2: '',
        category3: ''
      }));
      setIsCategory3Disabled(true);
    } else {
      setCategory2Options([]);
      setCategory3Options([]);
      setIsCategory3Disabled(true);
    }
  }, [formData.category1]);

  // カテゴリ2を選択したときにカテゴリ3のオプションを更新
  useEffect(() => {
    if (formData.category1 && formData.category2 && 
        CATEGORY_HIERARCHY[formData.category1] && 
        CATEGORY_HIERARCHY[formData.category1][formData.category2]) {
      
      const cat3Options = CATEGORY_HIERARCHY[formData.category1][formData.category2];
      setCategory3Options(cat3Options);
      
      // カテゴリ3のオプションがある場合のみ有効化
      setIsCategory3Disabled(cat3Options.length === 0);
      
      // カテゴリ3をリセット
      setFormData(prev => ({
        ...prev,
        category3: ''
      }));
    } else {
      setCategory3Options([]);
      setIsCategory3Disabled(true);
    }
  }, [formData.category1, formData.category2]);

  // 現在の年月を取得してデフォルト値を設定
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    // 月は0から始まるため+1し、2桁にパディング
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      fiscal_month: `${year}/${month}`
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!formData.fiscal_month || !formData.category1 || !formData.amount) {
        throw new Error('必須項目をすべて入力してください');
      }
      
      // 会計月のフォーマットをチェック (YYYY/MM)
      const fiscalMonthPattern = /^\d{4}\/\d{2}$/;
      if (!fiscalMonthPattern.test(formData.fiscal_month)) {
        throw new Error('会計月のフォーマットが正しくありません。YYYY/MM形式で入力してください');
      }
      
      // 金額を数値に変換
      const amountValue = formData.amount ? parseFloat(formData.amount) : null;
      
      // Check if supabase is properly initialized
      if (!supabase) {
        throw new Error('データベース接続が初期化されていません');
      }
      
      const { data, error: supabaseError } = await supabase
        .from('financial_data')
        .insert({
          company_name: formData.company_name,
          fiscal_month: formData.fiscal_month,
          category1: formData.category1,
          category2: formData.category2 || null,
          category3: formData.category3 || null,
          amount: amountValue,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .select();
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message || 'データの保存中にエラーが発生しました');
      }
      
      // Success! Reset the form
      setFormData({
        company_name: 'Default Company',
        fiscal_month: formData.fiscal_month, // 会計月は維持
        category1: '',
        category2: '',
        category3: '',
        amount: '',
        notes: '',
      });
      
      // Notify parent component to refresh data
      onSuccess();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'フォーム送信中にエラーが発生しました';
      setError(errorMessage);
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // カテゴリーのオプション
  const category1Options = Object.keys(CATEGORY_HIERARCHY);

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">会社名</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">会計月</label>
          <input
            type="text"
            name="fiscal_month"
            value={formData.fiscal_month}
            onChange={handleChange}
            placeholder="YYYY/MM"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
          <p className="mt-1 text-xs text-gray-500">例: 2024/02</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">カテゴリ1</label>
          <select
            name="category1"
            value={formData.category1}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">選択してください</option>
            {category1Options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">カテゴリ2</label>
          <select
            name="category2"
            value={formData.category2}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={category2Options.length === 0}
          >
            <option value="">選択してください</option>
            {category2Options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">カテゴリ3</label>
          <select
            name="category3"
            value={formData.category3}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isCategory3Disabled}
          >
            <option value="">選択してください</option>
            {category3Options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">金額</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">備考</label>
          <input
            type="text"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div className="lg:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? '送信中...' : '保存'}
          </button>
        </div>
      </form>
    </>
  );
};

export default DataEntryForm;