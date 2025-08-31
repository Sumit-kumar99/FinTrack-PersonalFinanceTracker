import React from 'react';

const TransactionList = ({ loading, transactions, transactionPage, setTransactionPage, totalPages, refreshData }) => {
    return (
      <div className="p-8 space-y-8 bg-gray-100 min-h-screen text-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-extrabold text-gray-800">All Transactions</h2>
          {refreshData && (
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          )}
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-500 text-lg">Loading transactions...</div>
          ) : transactions && transactions.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200 text-gray-800 rounded-t-xl">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-xl">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount (₹)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((t) => (
                    <tr key={t.id} className={t.type === 'INCOME' ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.description}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₹{t.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-500">
                      Page {transactionPage + 1} of {totalPages || 1}
                  </div>
                  <div className="flex space-x-2">
                      <button
                          onClick={() => setTransactionPage(p => Math.max(0, p - 1))}
                          disabled={transactionPage === 0}
                          className="py-2 px-4 rounded-full text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                          Previous
                      </button>
                      <button
                          onClick={() => setTransactionPage(p => p + 1)}
                          disabled={totalPages && transactionPage >= totalPages - 1}
                          className="py-2 px-4 rounded-full text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                          Next
                      </button>
                  </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg mb-2">No transactions found.</p>
              <p className="text-sm">Start by adding a new entry!</p>
            </div>
          )}
        </div>
      </div>
    );
};
export default TransactionList;
