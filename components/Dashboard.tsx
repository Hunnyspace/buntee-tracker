
import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../App';
import { User, DailyEntry } from '../types';
import { DEFAULT_BUN_PRICE, DEFAULT_OWNER_SHARE, DEFAULT_PARTNER_SHARE } from '../constants';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isOwner = user.role === 'OWNER';
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [bunsSold, setBunsSold] = useState(0);
  const [pricePerBun, setPricePerBun] = useState(DEFAULT_BUN_PRICE);
  const [otherSales, setOtherSales] = useState(0);
  
  const [ingredientsCost, setIngredientsCost] = useState(0);
  const [gasCost, setGasCost] = useState(0);
  const [packagingCost, setPackagingCost] = useState(0);
  const [miscCost, setMiscCost] = useState(0);

  const [ownerSharePercent, setOwnerSharePercent] = useState(DEFAULT_OWNER_SHARE);
  const [partnerSharePercent, setPartnerSharePercent] = useState(DEFAULT_PARTNER_SHARE);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Calculations
  const revenue = useMemo(() => (bunsSold * pricePerBun) + otherSales, [bunsSold, pricePerBun, otherSales]);
  const totalExpenses = useMemo(() => ingredientsCost + gasCost + packagingCost + miscCost, [ingredientsCost, gasCost, packagingCost, miscCost]);
  const netProfit = useMemo(() => revenue - totalExpenses, [revenue, totalExpenses]);
  const ownerAmount = useMemo(() => (netProfit * ownerSharePercent) / 100, [netProfit, ownerSharePercent]);
  const partnerAmount = useMemo(() => (netProfit * partnerSharePercent) / 100, [netProfit, partnerSharePercent]);

  const fetchEntry = async (targetDate: string) => {
    try {
      const docRef = doc(db, 'dailySales', targetDate);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as DailyEntry;
        setBunsSold(data.bunsSold);
        setPricePerBun(data.pricePerBun);
        setOtherSales(data.otherSales);
        setIngredientsCost(data.ingredientsCost);
        setGasCost(data.gasCost);
        setPackagingCost(data.packagingCost);
        setMiscCost(data.miscCost);
        setOwnerSharePercent(data.ownerSharePercent);
        setPartnerSharePercent(data.partnerSharePercent);
        setMessage({ text: 'Existing data loaded for this date.', type: 'info' });
      } else {
        // Reset to defaults if no entry exists
        setBunsSold(0);
        setOtherSales(0);
        setIngredientsCost(0);
        setGasCost(0);
        setPackagingCost(0);
        setMiscCost(0);
        setMessage({ text: '', type: '' });
      }
    } catch (error) {
      console.error("Error fetching entry:", error);
    }
  };

  useEffect(() => {
    fetchEntry(date);
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const entry: DailyEntry = {
        date,
        bunsSold,
        pricePerBun,
        otherSales,
        revenue,
        ingredientsCost,
        gasCost,
        packagingCost,
        miscCost,
        totalExpenses,
        netProfit,
        ownerSharePercent,
        partnerSharePercent,
        ownerAmount,
        partnerAmount,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'dailySales', date), entry);
      setMessage({ text: 'Sales recorded successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to save data. Try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#5D4037]">Daily Dashboard</h2>
          <p className="text-gray-500">Track and manage your stall performance</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-[#D2B48C] inline-flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-500">Select Date:</span>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="outline-none font-bold text-[#5D4037]"
          />
        </div>
      </header>

      {message.text && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <div className="w-2 h-2 rounded-full bg-current"></div>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Card */}
        <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">🍞</div>
            <h3 className="text-lg font-bold text-[#5D4037]">Sales Details</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">Buns Sold</label>
              <input 
                type="number" 
                disabled={!isOwner}
                className="w-24 px-3 py-1 border rounded text-right focus:ring-2 focus:ring-[#5D4037]"
                value={bunsSold}
                onChange={(e) => setBunsSold(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">Price per Bun (₹)</label>
              <input 
                type="number" 
                disabled={!isOwner}
                className="w-24 px-3 py-1 border rounded text-right focus:ring-2 focus:ring-[#5D4037]"
                value={pricePerBun}
                onChange={(e) => setPricePerBun(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">Other Sales (Tea/Extras)</label>
              <input 
                type="number" 
                disabled={!isOwner}
                className="w-24 px-3 py-1 border rounded text-right focus:ring-2 focus:ring-[#5D4037]"
                value={otherSales}
                onChange={(e) => setOtherSales(Number(e.target.value))}
              />
            </div>
            <div className="pt-4 border-t flex justify-between items-center font-bold text-lg text-[#5D4037]">
              <span>Total Revenue</span>
              <span>₹{revenue.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Expenses Card */}
        <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">📉</div>
            <h3 className="text-lg font-bold text-[#5D4037]">Expenses</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">Ingredients</label>
              <input 
                type="number" 
                disabled={!isOwner}
                className="w-24 px-3 py-1 border rounded text-right focus:ring-2 focus:ring-[#5D4037]"
                value={ingredientsCost}
                onChange={(e) => setIngredientsCost(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">Gas / Fuel</label>
              <input 
                type="number" 
                disabled={!isOwner}
                className="w-24 px-3 py-1 border rounded text-right focus:ring-2 focus:ring-[#5D4037]"
                value={gasCost}
                onChange={(e) => setGasCost(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">Packaging</label>
              <input 
                type="number" 
                disabled={!isOwner}
                className="w-24 px-3 py-1 border rounded text-right focus:ring-2 focus:ring-[#5D4037]"
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">Misc</label>
              <input 
                type="number" 
                disabled={!isOwner}
                className="w-24 px-3 py-1 border rounded text-right focus:ring-2 focus:ring-[#5D4037]"
                value={miscCost}
                onChange={(e) => setMiscCost(Number(e.target.value))}
              />
            </div>
            <div className="pt-4 border-t flex justify-between items-center font-bold text-lg text-red-800">
              <span>Total Expenses</span>
              <span>₹{totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Profit Split Card */}
        <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 md:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">💰</div>
                <h3 className="text-lg font-bold text-[#5D4037]">Net Profit & Split</h3>
              </div>
              <div className="bg-[#FDFCF0] p-4 rounded-xl border border-[#D2B48C] mb-4">
                <p className="text-sm text-gray-500 mb-1">Total Daily Profit</p>
                <p className="text-3xl font-black text-green-700">₹{netProfit.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Owner ({ownerSharePercent}%)</p>
                  <p className="text-xl font-bold text-[#5D4037]">₹{ownerAmount.toLocaleString()}</p>
                  {isOwner && (
                    <input 
                      type="range" min="0" max="100" 
                      value={ownerSharePercent}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setOwnerSharePercent(val);
                        setPartnerSharePercent(100 - val);
                      }}
                      className="w-full mt-2 accent-[#5D4037]"
                    />
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Partner ({partnerSharePercent}%)</p>
                  <p className="text-xl font-bold text-[#5D4037]">₹{partnerAmount.toLocaleString()}</p>
                </div>
              </div>
              {isOwner && (
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5D4037] text-white py-3 rounded-xl font-bold hover:bg-[#3E2723] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Save Daily Entry'}
                  {!loading && <span>➔</span>}
                </button>
              )}
              {!isOwner && (
                <div className="text-center p-3 text-sm text-gray-400 italic">
                  Partner View: Entries can only be modified by Owner.
                </div>
              )}
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default Dashboard;
