import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

// This component handles transaction entry and receipt uploads.
const EntryForm = ({ token, showMessage, refreshData }) => {
    const [newEntry, setNewEntry] = useState({
        type: 'EXPENSE',
        description: '',
        amount: '',
        date: new Date().toISOString().substring(0, 10),
    });
    const [loading, setLoading] = useState(false);

    const handleAddEntry = async (e) => {
        e.preventDefault();
        if (!newEntry.description || !newEntry.amount) {
            showMessage("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const requestBody = {
                description: newEntry.description,
                amount: parseFloat(newEntry.amount),
                type: newEntry.type,
                date: newEntry.date,
            };
            
            console.log('Sending transaction data:', requestBody);
            
            const response = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (response.ok) {
                const result = await response.json();
                console.log('Success response:', result);
                showMessage("Entry added successfully!");
                setNewEntry({
                    type: 'EXPENSE',
                    description: '',
                    amount: '',
                    date: new Date().toISOString().substring(0, 10),
                });
                
                // Refresh all data to update dashboard, transactions, and summaries
                if (refreshData) {
                    try {
                        await refreshData();
                    } catch (refreshError) {
                        console.error("Error refreshing data:", refreshError);
                        showMessage("Entry added but failed to refresh data. Please refresh manually.");
                    }
                }
            } else if (response.status === 401 || response.status === 403) {
                showMessage("Session expired. Please log in again.");
                // Don't refresh data if authentication failed
            } else {
                try {
                    const errorData = await response.json();
                    console.log('Error response:', errorData);
                    const errorMessage = errorData.message || `Server error (${response.status})`;
                    showMessage(`Failed to add entry: ${errorMessage}`);
                } catch (parseError) {
                    console.log('Error parsing response:', parseError);
                    showMessage(`Failed to add entry: Server error (${response.status})`);
                }
            }
        } catch (error) {
            console.error("Network error:", error);
            if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
                showMessage("Network error. Please check your connection.");
            } else {
                showMessage("Failed to add entry. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        
        try {
            showMessage(`Uploading and processing ${file.name}...`);
            const response = await fetch(`${API_BASE_URL}/transactions/upload-receipt`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                showMessage("Receipt processed successfully!");
                
                // Automatically add the expense from receipt data
                if (result.description && result.amount) {
                    try {
                        const transactionResponse = await fetch(`${API_BASE_URL}/transactions`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                description: result.description,
                                amount: result.amount,
                                type: 'EXPENSE',
                                date: result.date || new Date().toISOString().substring(0, 10),
                            }),
                        });

                        if (transactionResponse.ok) {
                            showMessage("Receipt processed and expense added automatically!");
                            
                            // Refresh all data to update dashboard, transactions, and summaries
                            if (refreshData) {
                                try {
                                    await refreshData();
                                } catch (refreshError) {
                                    console.error("Error refreshing data:", refreshError);
                                    showMessage("Receipt processed but failed to refresh data. Please refresh manually.");
                                }
                            }
                        } else if (transactionResponse.status === 401 || transactionResponse.status === 403) {
                            showMessage("Session expired. Please log in again.");
                        } else {
                            showMessage("Receipt processed but failed to add expense automatically.");
                        }
                    } catch (error) {
                        console.error("Error adding receipt transaction:", error);
                        showMessage("Receipt processed but failed to add expense automatically.");
                    }
                }
                
                // Also populate the form with receipt data for manual editing if needed
                setNewEntry({
                    type: 'EXPENSE',
                    description: result.description || '',
                    amount: result.amount || '',
                    date: result.date || new Date().toISOString().substring(0, 10),
                });
            } else if (response.status === 401 || response.status === 403) {
                showMessage("Session expired. Please log in again.");
            } else {
                showMessage(`Error: ${result.message || 'Failed to process receipt.'}`);
            }
        } catch (error) {
            console.error("Error uploading receipt:", error);
            if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
                showMessage("Network error. Please check your connection.");
            } else {
                showMessage("Failed to upload receipt. Please try again.");
            }
        }
    };

    return (
      <div className="p-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Add New Entry</h2>
        <form onSubmit={handleAddEntry} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="type"
                name="type"
                value={newEntry.type}
                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                className="mt-1 block w-full rounded-2xl bg-gray-50 border-gray-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-800"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                className="mt-1 block w-full rounded-2xl bg-gray-50 border-gray-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-800"
                required
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (₹)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newEntry.amount}
                onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                className="mt-1 block w-full rounded-2xl bg-gray-50 border-gray-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-800"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="mt-1 block w-full rounded-2xl bg-gray-50 border-gray-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-800"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 border border-transparent rounded-full shadow-lg text-lg font-bold text-white transition-all transform hover:scale-105 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700'}`}
          >
            {loading ? 'Adding...' : 'Add Entry'}
          </button>
        </form>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-4 border border-white/20">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Upload Receipt</h3>
          <p className="text-sm text-gray-500">Upload a receipt image or PDF to automatically extract and add the expense.</p>
          <label className="block">
            <span className="sr-only">Choose a file</span>
            <input type="file" onChange={handleReceiptUpload} accept="image/*,.pdf" className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors cursor-pointer" />
          </label>
        </div>
      </div>
    );
};
export default EntryForm;
