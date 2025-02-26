'use client';

import React, { useState } from 'react';
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      // Ensure fiscal_month is in the correct format (YYYY/M/D)
      const fiscalMonthPattern = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
      if (!fiscalMonthPattern.test(formData.fiscal_month)) {
        throw new Error('会計月のフォーマットが正しくありません。YYYY/M/D形式で入力してください');
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
        fiscal_month: '',
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
  const category1Options = ['売上高', '製造原価', '販売費・一般管理費', '営業外収益', '営業外費用'];
  const category2Options = ['派遣業', '警備業', '派遣人件費', '警備人件費', '法定福利費', '福利厚生費', '給与手当'];

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
            placeholder="YYYY/M/D"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
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
          >
            <option value="">選択してください</option>
            {category2Options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">カテゴリ3</label>
          <input
            type="text"
            name="category3"
            value={formData.category3 || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
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