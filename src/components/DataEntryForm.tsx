'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface DataEntryFormProps {
  onSuccess: () => void;
}

const DataEntryForm = ({ onSuccess }: DataEntryFormProps) => {
  const [formData, setFormData] = useState({
    company_name: 'Default Company',
    fiscal_month: '',
    category1: '',
    category2: '',
    category3: '',
    amount: '',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // 金額を数値に変換
      const amountValue = formData.amount ? parseFloat(formData.amount) : null;
      
      const { error } = await supabase.from('financial_data').insert({
        ...formData,
        amount: amountValue,
        updated_at: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      // フォームをリセット
      setFormData({
        company_name: 'Default Company',
        fiscal_month: '',
        category1: '',
        category2: '',
        category3: '',
        amount: '',
        notes: '',
      });
      
      // データを更新
      onSuccess();
      
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // カテゴリーのオプション
  const category1Options = ['売上高', '製造原価', '販売費・一般管理費', '営業外収益', '営業外費用'];
  const category2Options = ['派遣業', '警備業', '派遣人件費', '警備人件費', '法定福利費', '福利厚生費', '給与手当'];

  return (
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
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSubmitting ? '送信中...' : '保存'}
        </button>
      </div>
    </form>
  );
};

export default DataEntryForm;