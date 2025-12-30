
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../App';
import { DailyEntry } from '../types';
import { GoogleGenAI } from "@google/genai";

const Summary: React.FC<{ user: any }> = ({ user }) => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [aiInsight, setAiInsight] = useState<string>('');
  const [insightLoading, setInsightLoading] = useState(false);

  const fetchMonth = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'dailySales'),
        where('date', '>=', `${selectedMonth}-01`),
        where('date', '<=', `${selectedMonth}-31`)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data() as DailyEntry);
      setEntries(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonth();
    setAiInsight(''); // Reset insights when month changes
  }, [selectedMonth]);

  const totals = useMemo(() => {
    return entries.reduce((acc, curr) => ({
      buns: acc.buns + curr.bunsSold,
      revenue: acc.revenue + curr.revenue,
      expenses: acc.expenses + curr.totalExpenses,
      profit: acc.profit + curr.netProfit,
      owner: acc.owner + curr.ownerAmount,
      partner: acc.partner + curr.partnerAmount,
    }), { buns: 0, revenue: 0, expenses: 0, profit: 0, owner: 0, partner: 0 });
  }, [entries]);

  // Generate business insights using Gemini
  const generateAiInsight = async () => {
    if (entries.length === 0) return;
    setInsightLoading(true);
    try {
      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this month's business data for a bun stall:
      - Total Buns Sold: ${totals.buns}
      - Total Revenue: ₹${totals.revenue}
      - Total Expenses: ₹${totals.expenses}
      - Net Profit: ₹${totals.profit}
      - Active Days: ${entries.length}
      
      Provide 3 concise, actionable business tips to increase profit margin or operational efficiency. Use a professional yet supportive tone.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      setAiInsight(response.text || 'Unable to generate insights at this time.');
    } catch (error) {
      console.error("Gemini Error:", error);
      setAiInsight('Failed to load AI suggestions. Please try again.');
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#5D4037]">Monthly Summary</h2>
          <p className="text-gray-500">Aggregated performance and payouts</p>
        </div>
        <input 
          type="month" 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-white px-3 py-2 rounded-lg border border-[#D2B48C] font-bold text-[#5D4037] outline-none shadow-sm"
        />
      </header>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <div className="bg-[#5D4037] text-white p-8 rounded-3xl shadow-xl transform hover:-translate-y-1 transition-all">
            <p className="text-tan-100 opacity-80 uppercase tracking-widest text-xs font-bold mb-2">Total Monthly Revenue</p>
            <h3 className="text-4xl font-black">₹{totals.revenue.toLocaleString()}</h3>
            <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-sm opacity-80">
              <span>Buns Sold</span>
              <span className="font-bold">{totals.buns}</span>
            </div>
          </div>

          {/* Profit Card */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-all">
            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2">Total Net Profit</p>
            <h3 className="text-4xl font-black text-green-700">₹{totals.profit.toLocaleString()}</h3>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Expenses</span>
              <span className="font-bold text-red-600">₹{totals.expenses.toLocaleString()}</span>
            </div>
          </div>

          {/* Split Summary Card */}
          <div className="bg-[#FDFCF0] p-8 rounded-3xl shadow-lg border-2 border-[#D2B48C] md:col-span-2 lg:col-span-1">
             <h4 className="text-lg font-bold text-[#5D4037] mb-6 flex items-center gap-2">
               <span className="w-2 h-6 bg-[#D2B48C] rounded-full"></span>
               Final Payouts
             </h4>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#5D4037] text-white flex items-center justify-center rounded-full font-bold">O</div>
                    <span className="font-bold text-gray-700">Owner Payout</span>
                  </div>
                  <span className="text-2xl font-black text-[#5D4037]">₹{totals.owner.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D2B48C] text-[#5D4037] flex items-center justify-center rounded-full font-bold">P</div>
                    <span className="font-bold text-gray-700">Partner Payout</span>
                  </div>
                  <span className="text-2xl font-black text-[#5D4037]">₹{totals.partner.toLocaleString()}</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Gemini Business Insights Section */}
      {!loading && entries.length > 0 && (
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">💡</div>
              <h3 className="text-lg font-bold text-[#5D4037]">AI Business Consultant</h3>
            </div>
            {!aiInsight && (
              <button 
                onClick={generateAiInsight}
                disabled={insightLoading}
                className="bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {insightLoading ? 'Analyzing...' : 'Generate Tips'}
              </button>
            )}
          </div>
          
          {aiInsight ? (
            <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50">
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed italic">
                {aiInsight}
              </div>
              <button 
                onClick={() => setAiInsight('')}
                className="mt-4 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors uppercase"
              >
                ← Refresh Suggestions
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              {insightLoading ? 'Gemini is evaluating your business performance...' : 'Tap the button above to get personalized AI business insights.'}
            </div>
          )}
        </section>
      )}

      {!loading && entries.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm italic text-gray-400 text-sm text-center">
          Summary based on {entries.length} recorded business days in {selectedMonth}.
        </div>
      )}
    </div>
  );
};

export default Summary;
