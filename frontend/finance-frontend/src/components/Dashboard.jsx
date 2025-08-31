import React from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const CHART_COLORS = ['#38bdf8', '#fb923c', '#e879f9', '#facc15', '#a78bfa', '#2dd4bf'];

// This component is for displaying financial data summaries and charts.
const Dashboard = ({ loading, user, summaryData, categorySummary, dailySummary, transactions, refreshData }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }
  
  // Create chart data from all expense transactions
  const expenseTransactions = transactions?.filter(t => t.type === 'EXPENSE') || [];
  const expenseData = expenseTransactions.reduce((acc, transaction) => {
    const category = transaction.category?.name || 'Uncategorized';
    const existingCategory = acc.find(item => item.name === category);
    
    if (existingCategory) {
      existingCategory.value += transaction.amount || 0;
    } else {
      acc.push({
        name: category,
        value: transaction.amount || 0
      });
    }
    return acc;
  }, []);

  // Sort by value for better visualization
  const sortedExpenseData = expenseData.sort((a, b) => b.value - a.value);
  
  const hasMultipleExpenseCategories = sortedExpenseData.length > 1 || (sortedExpenseData.length === 1 && sortedExpenseData[0].name !== 'Uncategorized');

  return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8 space-y-8">
       <div className="flex justify-between items-center">
         <div className="flex items-center space-x-4">
           <div className="p-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl shadow-lg">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
             </svg>
           </div>
           <div>
             <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Financial Dashboard</h2>
             <p className="text-gray-600 mt-1">Track your finances with precision</p>
           </div>
         </div>
         {refreshData && (
           <button
             onClick={refreshData}
             className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl hover:from-sky-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 2 0 01-15.357-2m15.357 2H15" />
             </svg>
             <span className="font-semibold">Refresh</span>
           </button>
         )}
       </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-1 space-y-8">
               <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                   <div className="flex items-center space-x-4 mb-6">
                       <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                           {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                       </div>
                       <div>
                           <h3 className="text-xl font-bold text-gray-800">Welcome back, {user?.username || 'User'}! 👋</h3>
                           <p className="text-sm text-gray-500">Your financial summary at a glance.</p>
                       </div>
                   </div>
                                     <div className="space-y-4">
                       <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 flex justify-between items-center border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex items-center space-x-3">
                               <div className="p-2 bg-green-100 rounded-xl">
                                   <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                   </svg>
                               </div>
                               <div>
                                   <p className="text-sm text-green-600 font-medium">Total Income</p>
                                   <p className="text-xs text-green-500">Money earned</p>
                               </div>
                           </div>
                           <p className="text-2xl font-bold text-green-700">₹{summaryData?.totalIncome?.toFixed(2) || '0.00'}</p>
                       </div>
                       <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 flex justify-between items-center border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex items-center space-x-3">
                               <div className="p-2 bg-red-100 rounded-xl">
                                   <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                   </svg>
                               </div>
                               <div>
                                   <p className="text-sm text-red-600 font-medium">Total Expenses</p>
                                   <p className="text-xs text-red-500">Money spent</p>
                               </div>
                           </div>
                           <p className="text-2xl font-bold text-red-700">₹{summaryData?.totalExpense?.toFixed(2) || '0.00'}</p>
                       </div>
                       <div className={`bg-gradient-to-r ${(summaryData?.balance || 0) >= 0 ? 'from-green-50 to-emerald-50' : 'from-red-50 to-pink-50'} rounded-2xl p-4 flex justify-between items-center border ${(summaryData?.balance || 0) >= 0 ? 'border-green-200' : 'border-red-200'} shadow-sm hover:shadow-md transition-shadow`}>
                           <div className="flex items-center space-x-3">
                               <div className={`p-2 rounded-xl ${(summaryData?.balance || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                   <svg className={`w-5 h-5 ${(summaryData?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                   </svg>
                               </div>
                               <div>
                                   <p className={`text-sm font-medium ${(summaryData?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>Net Balance</p>
                                   <p className={`text-xs ${(summaryData?.balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>Current balance</p>
                               </div>
                           </div>
                           <p className={`text-2xl font-bold ${(summaryData?.balance || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>₹{summaryData?.balance?.toFixed(2) || '0.00'}</p>
                       </div>
                   </div>
              </div>
                             <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                   <div className="flex items-center space-x-3 mb-6">
                       <div className="p-2 bg-blue-100 rounded-xl">
                           <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                           </svg>
                       </div>
                       <h3 className="text-2xl font-bold text-gray-800">Recent Transactions</h3>
                   </div>
                  {transactions && transactions.slice(0, 5).length > 0 ? (
                      <div className="divide-y divide-gray-200">
                                                     {transactions.slice(0, 5).map((t) => (
                               <div key={t.id} className={`py-4 flex items-center justify-between space-x-4 hover:bg-gray-50 rounded-xl p-2 transition-colors`}>
                                   <div className="flex items-center space-x-3">
                                       <div className={`p-2 rounded-xl ${t.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                                           <svg className={`w-4 h-4 ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.type === 'INCOME' ? "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" : "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"} />
                                           </svg>
                                       </div>
                                       <div>
                                           <p className="font-semibold text-gray-800">{t.description}</p>
                                           <p className="text-xs text-gray-500 mt-1">{new Date(t.date).toLocaleDateString()}</p>
                                       </div>
                                   </div>
                                   <p className={`text-lg font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                       {t.type === 'INCOME' ? '+' : '-'}₹{t.amount?.toFixed(2) || '0.00'}
                                   </p>
                               </div>
                           ))}
                      </div>
                  ) : (
                      <div className="text-center text-gray-500 py-4">No recent transactions.</div>
                  )}
              </div>
          </div>
                     <div className="lg:col-span-2 space-y-8">
                              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Income vs Expenses Overview</h3>
                    </div>
                                       <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
                            <p className="text-sm text-green-600 font-medium">Total Income</p>
                            <p className="text-2xl font-bold text-green-700">₹{summaryData?.totalIncome?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200 shadow-sm">
                            <p className="text-sm text-red-600 font-medium">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-700">₹{summaryData?.totalExpense?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                   <ResponsiveContainer width="100%" height={200}>
                       <BarChart data={[
                           { name: 'Income', value: summaryData?.totalIncome || 0 },
                           { name: 'Expenses', value: summaryData?.totalExpense || 0 }
                       ]}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                           <XAxis dataKey="name" stroke="#6b7280" />
                           <YAxis stroke="#6b7280" />
                           <Tooltip
                               contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                               itemStyle={{ color: '#1f2937' }}
                               formatter={(value) => `₹${value?.toFixed(2) || '0.00'}`}
                           />
                           <Bar dataKey="value" name="Amount">
                               <Cell fill="#2dd4bf" />
                               <Cell fill="#fb923c" />
                           </Bar>
                       </BarChart>
                                        </ResponsiveContainer>
                 </div>
                                                           {dailySummary && dailySummary.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                      <div className="flex items-center space-x-3 mb-6">
                          <div className="p-2 bg-indigo-100 rounded-xl">
                              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                              </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800">Income & Expenses Over Time</h3>
                      </div>
                     <ResponsiveContainer width="100%" height={300}>
                         <LineChart data={dailySummary}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                             <XAxis dataKey="date" stroke="#6b7280" />
                             <YAxis stroke="#6b7280" />
                             <Tooltip
                                 contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                                 itemStyle={{ color: '#1f2937' }}
                                 formatter={(value) => `₹${value?.toFixed(2) || '0.00'}`}
                             />
                             <Legend />
                             <Line type="monotone" dataKey="totalExpense" stroke="#38bdf8" strokeWidth={2} name="Expenses" />
                             <Line type="monotone" dataKey="totalIncome" stroke="#2dd4bf" strokeWidth={2} name="Income" />
                         </LineChart>
                     </ResponsiveContainer>
                 </div>
               )}
                
                 {/* Expense Distribution Pie Chart */}
                 <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                     <div className="flex items-center space-x-3 mb-6">
                         <div className="p-2 bg-pink-100 rounded-xl">
                             <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                             </svg>
                         </div>
                         <h3 className="text-2xl font-bold text-gray-800">Expense Distribution</h3>
                     </div>
                     {hasMultipleExpenseCategories ? (
                         <ResponsiveContainer width="100%" height={300}>
                             <PieChart>
                                 <Pie
                                     dataKey="value"
                                     data={sortedExpenseData}
                                     cx="50%"
                                     cy="50%"
                                     outerRadius={100}
                                     labelLine={false}
                                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                 >
                                     {sortedExpenseData.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                     ))}
                                 </Pie>
                                 <Tooltip
                                     contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                                     itemStyle={{ color: '#1f2937' }}
                                     formatter={(value) => `₹${value?.toFixed(2) || '0.00'}`}
                                 />
                             </PieChart>
                         </ResponsiveContainer>
                     ) : (
                         <div className="text-center text-gray-500 py-10">
                             <p>You need to add categories to your expenses to see a distribution chart!</p>
                             <p className="mt-2 text-sm text-gray-400">All expenses are currently uncategorized.</p>
                         </div>
                     )}
                 </div>
          </div>
      </div>
    </div>
  );
};
export default
Dashboard;