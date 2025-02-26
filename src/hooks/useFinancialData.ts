'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useFinancialData() {
  const [isLoading, setIsLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // 財務データを取得
        const { data, error } = await supabase
          .from('financial_data')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          // 合計金額を計算
          const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
          setTotalAmount(total);
          
          // トランザクション数
          setTransactionCount(data.length);
          
          // カテゴリー数
          const uniqueCategories = new Set(data.map(item => item.category1));
          setCategoryCount(uniqueCategories.size);
          
          // 月次データを処理
          const monthlyTotals = {};
          data.forEach(item => {
            if (!monthlyTotals[item.fiscal_month]) {
              monthlyTotals[item.fiscal_month] = 0;
            }
            monthlyTotals[item.fiscal_month] += (item.amount || 0);
          });
          
          const months = Object.keys(monthlyTotals).sort();
          const processedMonthlyData = months.map(month => ({
            month,
            amount: monthlyTotals[month]
          }));
          
          setMonthlyData(processedMonthlyData);
          
          // 月次成長率
          if (months.length >= 2) {
            const latestMonth = months[months.length - 1];
            const previousMonth = months[months.length - 2];
            const growth = ((monthlyTotals[latestMonth] - monthlyTotals[previousMonth]) / monthlyTotals[previousMonth]) * 100;
            setMonthlyGrowth(growth);
          }
          
          // カテゴリーデータを処理
          const categoryTotals = {};
          data.forEach(item => {
            if (!categoryTotals[item.category1]) {
              categoryTotals[item.category1] = 0;
            }
            categoryTotals[item.category1] += (item.amount || 0);
          });
          
          const processedCategoryData = Object.entries(categoryTotals).map(([category, total]) => ({
            category,
            value: total
          }));
          
          setCategoryData(processedCategoryData);
        }
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  return {
    isLoading,
    totalAmount,
    transactionCount,
    categoryCount,
    monthlyGrowth,
    monthlyData,
    categoryData
  };
}