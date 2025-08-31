import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import TransactionList from './components/TransactionList';
import AuthForm from './components/AuthForm';

// This is the main application component.
const API_BASE_URL = 'http://localhost:8080/api';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [categorySummary, setCategorySummary] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionsResponse, setTransactionsResponse] = useState(null);

  const fetchData = useCallback(async () => {
    const storedToken = localStorage.getItem('jwtToken');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setToken(storedToken);
    setLoading(true);
    try {
      const headers = {
        'Authorization': `Bearer ${storedToken}`
      };
      const [
        summaryResponse,
        categoryResponse,
        dailyResponse,
        transactionsResponse
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/summary`, { headers }),
        fetch(`${API_BASE_URL}/summary/by-category`, { headers }),
        fetch(`${API_BASE_URL}/summary/by-day`, { headers }),
        fetch(`${API_BASE_URL}/transactions?page=${transactionPage}&size=10`, { headers })
      ]);

      const summaryJson = await summaryResponse.json();
      const categoryJson = await categoryResponse.json();
      const dailyJson = await dailyResponse.json();
      const transactionsJson = await transactionsResponse.json();

      setSummaryData(summaryJson);
      setCategorySummary(categoryJson);
      setDailySummary(dailyJson);
      setTransactions(transactionsJson.content);
      setTransactionsResponse(transactionsJson);
      // Use username from summary response or fallback to JWT token
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      setUser({ username: summaryJson.username || tokenPayload.sub || 'User' });

    } catch (error) {
      console.error("Failed to fetch data:", error);
      showMessage("Failed to fetch data. Please log in again.");
      handleSignOut();
    } finally {
      setLoading(false);
    }
  }, [token, transactionPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSignOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwtToken');
    showMessage("You have been signed out.");
  };

  const showMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 3000);
  };

  const renderContent = () => {
    if (!token) {
      return <AuthForm setToken={setToken} setUser={setUser} showMessage={showMessage} setAuthLoading={setIsAuthLoading} authLoading={isAuthLoading} authError={authError} />;
    }
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard loading={loading} user={user} summaryData={summaryData} categorySummary={categorySummary} dailySummary={dailySummary} transactions={transactions} refreshData={fetchData} />;
      case 'add-entry':
        return <EntryForm token={token} showMessage={showMessage} fetchData={fetchData} />;
      case 'transactions':
        return <TransactionList loading={loading} transactions={transactions} transactionPage={transactionPage} setTransactionPage={setTransactionPage} totalPages={transactionsResponse?.totalPages} refreshData={fetchData} />;
      default:
        return <Dashboard loading={loading} user={user} summaryData={summaryData} categorySummary={categorySummary} dailySummary={dailySummary} transactions={transactions} refreshData={fetchData} />;
    }
  };

  const MessageModal = ({ message, show }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
        <div className="relative bg-white text-gray-800 rounded-xl shadow-lg p-6 max-w-sm w-full text-center border border-gray-200">
          <p className="text-gray-800">{message}</p>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="min-h-screen bg-gray-100 font-sans antialiased text-gray-800">
        <header className="bg-white shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-sky-500">
                   <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.85-.29-.93-.575a1.127 1.127 0 0 1-.09-.375 1.127 1.127 0 0 1 .09-.375c.08-.285.39-.575.93-.575h4.5c.54 0 .85.29.93.575.08.285.09.375.09.375s-.01.09-.-09.375c-.08.285-.39.575-.93.575h-4.5Zm-.75 4.5c-.54 0-.85-.29-.93-.575a1.127 1.127 0 0 1-.09-.375 1.127 1.127 0 0 1 .09-.375c.08-.285.39-.575.93-.575h4.5c.54 0 .85.29.93.575.08.285.09.375.09.375s-.01.09-.09.375c-.08.285-.39.575-.93.575h-4.5Zm-1.875 4.5c-.54 0-.85-.29-.93-.575a1.127 1.127 0 0 1-.09-.375c-.01-.13-.02-.27-.02-.42 0-.25.04-.49.12-.73s.19-.46.33-.675c.14-.215.31-.4.5-.555l2.49-1.875c.175-.13.43-.13.605 0l2.49 1.875c.19.15.36.34.5.555.14.215.25.45.33.675.08.24.12.48.12.73 0 .15-.01.29-.02.42a1.127 1.127 0 0 1-.09.375c-.08.285-.39.575-.93.575h-4.5Z" clipRule="evenodd" />
               </svg>
               <h1 className="text-2xl font-bold text-gray-800">FinTrack</h1>
            </div>
            {token && (
              <nav className="flex items-center space-x-2 sm:space-x-4">
                <button onClick={() => setCurrentPage('dashboard')} className={`py-2 px-3 sm:px-4 rounded-full text-sm font-medium transition-colors ${currentPage === 'dashboard' ? 'bg-sky-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'}`}>Dashboard</button>
                <button onClick={() => setCurrentPage('add-entry')} className={`py-2 px-3 sm:px-4 rounded-full text-sm font-medium transition-colors ${currentPage === 'add-entry' ? 'bg-sky-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'}`}>Add Entry</button>
                <button onClick={() => setCurrentPage('transactions')} className={`py-2 px-3 sm:px-4 rounded-full text-sm font-medium transition-colors ${currentPage === 'transactions' ? 'bg-sky-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'}`}>Transactions</button>
                <button onClick={handleSignOut} className="py-2 px-3 sm:px-4 rounded-full text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg transition-colors">Sign Out</button>
              </nav>
            )}
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
        <MessageModal message={modalMessage} show={showModal} />
      </div>
    </>
  );
};

export default App;
