"use client";

import { useEffect, useMemo, useState } from "react";
import { BALLET_TERMS } from "./data/balletTerms";

const DICTIONARY_TABS = {
  DICTIONARY: "dictionary",
  CLASS: "class",
  EXPENSE: "expense",
};

const CATEGORY_COLORS = {
  기초: "bg-pink-100 text-pink-700 border-pink-200",
  바레슨: "bg-lime-100 text-lime-700 border-lime-200",
  센터: "bg-purple-100 text-purple-700 border-purple-200",
  알레그로: "bg-sky-100 text-sky-700 border-sky-200",
  그랑알레그로: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const TAB_COLORS = {
  active: "text-pink-600",
  inactive: "text-zinc-400",
};

const FAVORITES_KEY = "ballet-log:favorites";
const CLASS_LOGS_KEY = "ballet-log:class-logs";
const EXPENSES_KEY = "ballet-log:expenses";

export default function Home() {
  const [activeTab, setActiveTab] = useState(DICTIONARY_TABS.DICTIONARY);

  // Dictionary state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [favorites, setFavorites] = useState([]);

  // Class log state
  const [classDate, setClassDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [classSearch, setClassSearch] = useState("");
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [classMemo, setClassMemo] = useState("");
  const [classFeedback, setClassFeedback] = useState("");
  const [classLogs, setClassLogs] = useState([]);

  // Expense state
  const [expenseCategory, setExpenseCategory] = useState("학원비");
  const [expenseMonth, setExpenseMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");
  const [expenses, setExpenses] = useState([]);

  const isClient = typeof window !== "undefined";

  // Load from localStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      const favRaw = window.localStorage.getItem(FAVORITES_KEY);
      if (favRaw) {
        setFavorites(JSON.parse(favRaw));
      }
    } catch {
      // ignore
    }
    try {
      const logsRaw = window.localStorage.getItem(CLASS_LOGS_KEY);
      if (logsRaw) {
        setClassLogs(JSON.parse(logsRaw));
      }
    } catch {
      // ignore
    }
    try {
      const expensesRaw = window.localStorage.getItem(EXPENSES_KEY);
      if (expensesRaw) {
        setExpenses(JSON.parse(expensesRaw));
      }
    } catch {
      // ignore
    }
  }, [isClient]);

  // Persist favorites
  useEffect(() => {
    if (!isClient) return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, isClient]);

  // Persist class logs
  useEffect(() => {
    if (!isClient) return;
    window.localStorage.setItem(CLASS_LOGS_KEY, JSON.stringify(classLogs));
  }, [classLogs, isClient]);

  // Persist expenses
  useEffect(() => {
    if (!isClient) return;
    window.localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses, isClient]);

  const filteredTerms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return BALLET_TERMS.filter((t) => {
      const matchesCategory =
        categoryFilter === "전체" || t.category === categoryFilter;
      const matchesQuery =
        !q ||
        t.french.toLowerCase().includes(q) ||
        t.korean.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [searchTerm, categoryFilter]);

  const classSearchResults = useMemo(() => {
    const q = classSearch.trim().toLowerCase();
    if (!q) return [];
    return BALLET_TERMS.filter(
      (t) =>
        t.french.toLowerCase().includes(q) ||
        t.korean.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [classSearch]);

  const monthlyTotals = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      if (!map[e.month]) map[e.month] = 0;
      map[e.month] += e.amount;
    }
    return map;
  }, [expenses]);

  const yearlyTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const groupedClassLogs = useMemo(() => {
    const map = {};
    for (const log of classLogs) {
      if (!map[log.date]) map[log.date] = [];
      map[log.date].push(log);
    }
    const sortedDates = Object.keys(map).sort((a, b) => (a > b ? -1 : 1));
    return { map, sortedDates };
  }, [classLogs]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addTermToClass = (term) => {
    if (selectedTerms.find((t) => t.id === term.id)) return;
    setSelectedTerms((prev) => [...prev, term]);
    setClassSearch("");
  };

  const removeSelectedTerm = (id) => {
    setSelectedTerms((prev) => prev.filter((t) => t.id !== id));
  };

  const saveClassLog = () => {
    if (!classDate || selectedTerms.length === 0) return;
    const newLog = {
      id: Date.now(),
      date: classDate,
      termIds: selectedTerms.map((t) => t.id),
      memo: classMemo,
      feedback: classFeedback,
    };
    setClassLogs((prev) => [newLog, ...prev]);
    setSelectedTerms([]);
    setClassMemo("");
    setClassFeedback("");
  };

  const saveExpense = () => {
    const amount = Number(expenseAmount);
    if (!expenseMonth || !amount || amount <= 0) return;
    const newExpense = {
      id: Date.now(),
      category: expenseCategory,
      month: expenseMonth,
      amount,
      note: expenseNote,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    setExpenseAmount("");
    setExpenseNote("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-lavender-50 to-mint-50 font-sans text-zinc-900">
      <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white/70 shadow-sm backdrop-blur">
        {/* Header */}
        <header className="px-4 pt-6 pb-3 border-b border-pink-100 bg-white/80 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-pink-600">
            발레로그 Ballet Log
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            취미 발레인의 연습 · 기록 · 리듬을 한 곳에
          </p>
        </header>

        {/* Content */}
        <section className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
          {activeTab === DICTIONARY_TABS.DICTIONARY && (
            <DictionaryTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              filteredTerms={filteredTerms}
            />
          )}

          {activeTab === DICTIONARY_TABS.CLASS && (
            <ClassLogTab
              classDate={classDate}
              setClassDate={setClassDate}
              classSearch={classSearch}
              setClassSearch={setClassSearch}
              classSearchResults={classSearchResults}
              selectedTerms={selectedTerms}
              addTermToClass={addTermToClass}
              removeSelectedTerm={removeSelectedTerm}
              classMemo={classMemo}
              setClassMemo={setClassMemo}
              classFeedback={classFeedback}
              setClassFeedback={setClassFeedback}
              saveClassLog={saveClassLog}
              groupedClassLogs={groupedClassLogs}
            />
          )}

          {activeTab === DICTIONARY_TABS.EXPENSE && (
            <ExpenseTab
              expenseCategory={expenseCategory}
              setExpenseCategory={setExpenseCategory}
              expenseMonth={expenseMonth}
              setExpenseMonth={setExpenseMonth}
              expenseAmount={expenseAmount}
              setExpenseAmount={setExpenseAmount}
              expenseNote={expenseNote}
              setExpenseNote={setExpenseNote}
              saveExpense={saveExpense}
              expenses={expenses}
              monthlyTotals={monthlyTotals}
              yearlyTotal={yearlyTotal}
            />
          )}
        </section>

        {/* Bottom Tab Navigation */}
        <nav className="sticky bottom-0 z-10 flex w-full max-w-md border-t border-pink-100 bg-white/90 px-2 py-1 backdrop-blur-sm">
          <button
            className={`flex flex-1 flex-col items-center justify-center rounded-full px-2 py-2 text-xs font-medium transition ${
              activeTab === DICTIONARY_TABS.DICTIONARY
                ? "bg-pink-50 text-pink-600"
                : "text-zinc-400"
            }`}
            onClick={() => setActiveTab(DICTIONARY_TABS.DICTIONARY)}
          >
            <span className="text-lg">📖</span>
            <span>용어사전</span>
          </button>
          <button
            className={`ml-1 flex flex-1 flex-col items-center justify-center rounded-full px-2 py-2 text-xs font-medium transition ${
              activeTab === DICTIONARY_TABS.CLASS
                ? "bg-purple-50 text-purple-600"
                : "text-zinc-400"
            }`}
            onClick={() => setActiveTab(DICTIONARY_TABS.CLASS)}
          >
            <span className="text-lg">🩰</span>
            <span>수업기록</span>
          </button>
          <button
            className={`ml-1 flex flex-1 flex-col items-center justify-center rounded-full px-2 py-2 text-xs font-medium transition ${
              activeTab === DICTIONARY_TABS.EXPENSE
                ? "bg-emerald-50 text-emerald-600"
                : "text-zinc-400"
            }`}
            onClick={() => setActiveTab(DICTIONARY_TABS.EXPENSE)}
          >
            <span className="text-lg">💰</span>
            <span>비용관리</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

function DictionaryTab({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  favorites,
  toggleFavorite,
  filteredTerms,
}) {
  const categories = ["전체", "기초", "바레슨", "센터", "알레그로", "그랑알레그로"];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-pink-50/60 p-3">
        <label className="mb-1 block text-xs font-medium text-pink-700">
          용어 검색 (한국어 / 프랑스어)
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="예) 피루엣, Plié, Arabesque..."
          className="w-full rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm placeholder:text-pink-200 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              categoryFilter === cat
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white text-zinc-500 border-pink-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3 pb-2">
        {filteredTerms.map((term) => {
          const isFavorite = favorites.includes(term.id);
          const categoryClass = CATEGORY_COLORS[term.category] ?? "bg-zinc-100";
          return (
            <article
              key={term.id}
              className="flex flex-col rounded-2xl border border-pink-100 bg-white/90 p-3 shadow-[0_4px_10px_rgba(248,187,208,0.2)]"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold italic text-zinc-900">
                    {term.french}
                  </p>
                  <p className="text-xs text-zinc-500">{term.korean}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryClass}`}
                  >
                    {term.category}
                  </span>
                  <button
                    onClick={() => toggleFavorite(term.id)}
                    className="ml-1 text-lg"
                    aria-label="즐겨찾기"
                  >
                    {isFavorite ? "⭐" : "☆"}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs leading-snug text-zinc-600">
                {term.description}
              </p>
              <div className="mt-2 flex justify-between text-xs">
                {term.youtubeUrl && (
                  <a
                    href={term.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-pink-500 px-3 py-1 text-[11px] font-medium text-white shadow-sm transition hover:bg-pink-600"
                  >
                    유튜브로 자세히 보기
                  </a>
                )}
                {favorites.length > 0 && (
                  <span className="ml-auto text-[10px] text-pink-400">
                    즐겨찾기 {favorites.length}개
                  </span>
                )}
              </div>
            </article>
          );
        })}

        {filteredTerms.length === 0 && (
          <p className="py-8 text-center text-xs text-zinc-400">
            아직 해당 조건의 용어가 없어요. 검색어 또는 카테고리를 바꿔보세요.
          </p>
        )}
      </div>
    </div>
  );
}

function ClassLogTab({
  classDate,
  setClassDate,
  classSearch,
  setClassSearch,
  classSearchResults,
  selectedTerms,
  addTermToClass,
  removeSelectedTerm,
  classMemo,
  setClassMemo,
  classFeedback,
  setClassFeedback,
  saveClassLog,
  groupedClassLogs,
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-purple-50/70 p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-purple-700">
              수업 날짜
            </label>
            <input
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="w-full rounded-xl border border-purple-100 bg-white px-3 py-1.5 text-xs focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-purple-700">
            오늘 배운/연습한 동작 검색 후 추가
          </label>
          <input
            type="text"
            value={classSearch}
            onChange={(e) => setClassSearch(e.target.value)}
            placeholder="예) 피루엣, 알레그로..."
            className="w-full rounded-xl border border-purple-100 bg-white px-3 py-1.5 text-xs placeholder:text-purple-200 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          {classSearchResults.length > 0 && (
            <div className="mt-1 max-h-36 space-y-1 overflow-y-auto rounded-xl border border-purple-100 bg-white p-1">
              {classSearchResults.map((term) => (
                <button
                  key={term.id}
                  onClick={() => addTermToClass(term)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs hover:bg-purple-50"
                >
                  <span className="text-left">
                    <span className="font-medium italic">{term.french}</span>{" "}
                    <span className="text-[11px] text-zinc-500">
                      {term.korean}
                    </span>
                  </span>
                  <span className="text-[11px] text-purple-500">추가</span>
                </button>
              ))}
            </div>
          )}

          {selectedTerms.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedTerms.map((t) => (
                <span
                  key={t.id}
                  className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] text-purple-700"
                >
                  <span className="italic">{t.french}</span>
                  <button
                    onClick={() => removeSelectedTerm(t.id)}
                    className="text-[11px] text-purple-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-purple-50/60 p-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-purple-700">
            오늘 수업 메모
          </label>
          <textarea
            rows={3}
            value={classMemo}
            onChange={(e) => setClassMemo(e.target.value)}
            placeholder="오늘 배운 콤비네이션, 느낌, 헷갈렸던 부분 등을 적어두세요."
            className="w-full rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs placeholder:text-purple-200 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-purple-700">
            선생님 피드백
          </label>
          <textarea
            rows={2}
            value={classFeedback}
            onChange={(e) => setClassFeedback(e.target.value)}
            placeholder="자세, 음악성, 방향 등 피드백을 적어두면 다음 수업 때 큰 도움이 돼요."
            className="w-full rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs placeholder:text-purple-200 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <button
          onClick={saveClassLog}
          className="w-full rounded-full bg-purple-500 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-600 disabled:bg-purple-200"
          disabled={!classDate || selectedTerms.length === 0}
        >
          수업 기록 저장하기
        </button>
      </div>

      <div className="space-y-2 pb-1">
        <h2 className="text-xs font-semibold text-zinc-500">
          날짜별 수업 기록
        </h2>
        {groupedClassLogs.sortedDates.length === 0 && (
          <p className="py-6 text-center text-xs text-zinc-400">
            아직 저장된 수업 기록이 없어요. 위에서 오늘 수업을 기록해보세요.
          </p>
        )}

        {groupedClassLogs.sortedDates.map((date) => (
          <div
            key={date}
            className="space-y-2 rounded-2xl border border-purple-50 bg-white/80 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-purple-600">
                {date}
              </p>
              <p className="text-[10px] text-zinc-400">
                {groupedClassLogs.map[date].length}개의 기록
              </p>
            </div>
            <div className="space-y-2">
              {groupedClassLogs.map[date].map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl bg-purple-50/80 px-2.5 py-2"
                >
                  <div className="mb-1 flex flex-wrap gap-1">
                    {log.termIds.map((id) => {
                      const term = BALLET_TERMS.find((t) => t.id === id);
                      if (!term) return null;
                      return (
                        <span
                          key={id}
                          className="rounded-full bg-white px-2 py-0.5 text-[10px] italic text-purple-700"
                        >
                          {term.french}
                        </span>
                      );
                    })}
                  </div>
                  {log.memo && (
                    <p className="text-[11px] leading-snug text-zinc-600">
                      {log.memo}
                    </p>
                  )}
                  {log.feedback && (
                    <p className="mt-1 text-[10px] leading-snug text-purple-500">
                      선생님: {log.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpenseTab({
  expenseCategory,
  setExpenseCategory,
  expenseMonth,
  setExpenseMonth,
  expenseAmount,
  setExpenseAmount,
  expenseNote,
  setExpenseNote,
  saveExpense,
  expenses,
  monthlyTotals,
  yearlyTotal,
}) {
  const months = Object.keys(monthlyTotals).sort((a, b) => (a > b ? -1 : 1));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-emerald-50/70 p-3">
        <p className="mb-2 text-xs text-emerald-700">
          발레에 쓰는 비용을 한눈에 정리해보세요. 월별 합계와 연간 총액을 자동으로 계산해줍니다.
        </p>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-emerald-700">
              카테고리
            </label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full rounded-xl border border-emerald-100 bg-white px-2 py-1.5 text-xs focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="학원비">학원비</option>
              <option value="용품">용품</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-emerald-700">
              월
            </label>
            <input
              type="month"
              value={expenseMonth}
              onChange={(e) => setExpenseMonth(e.target.value)}
              className="w-full rounded-xl border border-emerald-100 bg-white px-2 py-1.5 text-xs focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-emerald-700">
              금액 (원)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="예) 150000"
              className="w-full rounded-xl border border-emerald-100 bg-white px-2 py-1.5 text-xs placeholder:text-emerald-200 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-emerald-700">
              메모
            </label>
            <input
              type="text"
              value={expenseNote}
              onChange={(e) => setExpenseNote(e.target.value)}
              placeholder="예) 3월 등록, 토슈즈 구입"
              className="w-full rounded-xl border border-emerald-100 bg-white px-2 py-1.5 text-xs placeholder:text-emerald-200 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>
        <button
          onClick={saveExpense}
          disabled={!expenseMonth || !expenseAmount}
          className="mt-1 w-full rounded-full bg-emerald-500 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:bg-emerald-200"
        >
          비용 추가하기
        </button>
      </div>

      <div className="rounded-2xl bg-emerald-50/80 p-3">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-semibold text-emerald-700">
            연간 총 지출
          </p>
          <p className="text-sm font-semibold text-emerald-600">
            {yearlyTotal.toLocaleString()}원
          </p>
        </div>
        <div className="space-y-1">
          {months.length === 0 && (
            <p className="py-4 text-center text-xs text-emerald-400">
              아직 기록된 비용이 없어요. 위에서 첫 비용을 추가해보세요.
            </p>
          )}
          {months.map((m) => (
            <div
              key={m}
              className="flex items-center justify-between rounded-xl bg-white px-2.5 py-1.5 text-xs"
            >
              <span className="text-zinc-600">{m}</span>
              <span className="font-semibold text-emerald-600">
                {monthlyTotals[m].toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="space-y-1 pb-1">
          <h2 className="text-xs font-semibold text-zinc-500">
            상세 내역
          </h2>
          <div className="space-y-1">
            {expenses.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-emerald-50 bg-white/90 px-2.5 py-1.5 text-[11px]"
              >
                <div className="flex-1">
                  <p className="font-medium text-emerald-700">
                    {e.category} · {e.month}
                  </p>
                  {e.note && (
                    <p className="text-[10px] text-zinc-500">{e.note}</p>
                  )}
                </div>
                <p className="ml-2 text-[11px] font-semibold text-emerald-600">
                  {e.amount.toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

