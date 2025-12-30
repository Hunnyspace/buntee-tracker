
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../App';
import { DailyEntry } from '../types';

interface HistoryProps {
  user: any;
}

const History: React.FC<HistoryProps> = ({ user }) => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'dailySales'),
        where('date', '>=', `${selectedMonth}-01`),
        where('date', '<=', `${selectedMonth}-31`),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data() as DailyEntry);
      setEntries(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedMonth]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#5D4037]">Sales History</h2>
          <p className="text-gray-500">Review past entries and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-500">Filter Month:</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white px-3 py-2 rounded-lg border border-[#D2B48C] font-bold text-[#5D4037] outline-none"
          />
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="animate-spin h-8 w-8 border-4 border-[#5D4037] border-t-transparent rounded-full"></div>
            <p className="text-gray-400">Loading history...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-gray-400 text-lg">No entries found for this month.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#5D4037] text-white uppercase text-xs tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold text-center">Buns</th>
                  <th className="px-6 py-4 font-bold">Revenue</th>
                  <th className="px-6 py-4 font-bold">Expense</th>
                  <th className="px-6 py-4 font-bold">Profit</th>
                  <th className="px-6 py-4 font-bold">Owner Split</th>
                  <th className="px-6 py-4 font-bold">Partner Split</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => (
                  <tr key={entry.date} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#5D4037]">{entry.date}</td>
                    <td className="px-6 py-4 text-center">{entry.bunsSold}</td>
                    <td className="px-6 py-4 font-medium">₹{entry.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-600">₹{entry.totalExpenses.toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-700 font-bold">₹{entry.netProfit.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs">₹{entry.ownerAmount.toLocaleString()} ({entry.ownerSharePercent}%)</td>
                    <td className="px-6 py-4 text-xs">₹{entry.partnerAmount.toLocaleString()} ({entry.partnerSharePercent}%)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
