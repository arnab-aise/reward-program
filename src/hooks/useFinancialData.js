/**
 * useFinancialData hook.
 * Fetches the user's dashboard snapshot and derives game-relevant metrics.
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchSnapshot, askSherpa } from '../services/financeService';

/**
 * Derive game-relevant financial metrics from the raw snapshot.
 */
function deriveMetrics(snapshot) {
  if (!snapshot) return null;

  const paycheck = snapshot.paycheck || {};
  const statements = paycheck.statement || paycheck.statements || [];
  const income = paycheck.income || 0;
  const tdi = parseFloat(snapshot.tdi || '0');
  const totalAmountDue = parseFloat(snapshot.totalAmountDue || '0');

  // --- Income Trend ---
  // Compare the last two months of income
  let incomeTrend = 'stable';
  let incomeLastMonth = 0;
  let incomeThisMonth = income;

  if (statements.length >= 2) {
    const sorted = [...statements].sort((a, b) => {
      const dateA = new Date(a.pay_period_start);
      const dateB = new Date(b.pay_period_start);
      return dateA - dateB;
    });
    incomeLastMonth = sorted[sorted.length - 2]?.total_income || 0;
    incomeThisMonth = sorted[sorted.length - 1]?.total_income || income;

    if (incomeThisMonth > incomeLastMonth * 1.05) {
      incomeTrend = 'up';
    } else if (incomeThisMonth < incomeLastMonth * 0.95) {
      incomeTrend = 'down';
    }
  }

  // --- Bills ---
  const processedBills = snapshot.processedBills || {};
  const allBillsThisPeriod = processedBills.allBillsThisPayPeriod || [];
  const allBillsTotalAmount = processedBills.allBillsTotalAmount || totalAmountDue;

  // Check for overdue bills from allStatements
  const allStatements = snapshot.allBills?.allStatements || [];
  const now = Date.now();
  const overdueBills = allStatements.filter(stmt => {
    const dueDate = stmt.statementData?.dueDate;
    const lastPayDate = stmt.statementData?.lastPaymentDate;
    if (!dueDate) return false;
    return dueDate < now && (!lastPayDate || lastPayDate < dueDate);
  });

  // --- Budget Health ---
  const budgetSummary = snapshot.budgets?.summary || {};
  const totalBudget = budgetSummary.totalBudget || 0;
  const totalSpent = budgetSummary.totalSpent || 0;
  const remainingBudget = budgetSummary.remainingBudget || (totalBudget - totalSpent);
  let budgetHealth = 'no_budget';
  if (totalBudget > 0) {
    const spentRatio = totalSpent / totalBudget;
    if (spentRatio > 1) budgetHealth = 'over_budget';
    else if (spentRatio > 0.8) budgetHealth = 'warning';
    else budgetHealth = 'on_track';
  }

  // --- Salary:Bill Ratio ---
  const salaryBillRatio = income > 0 ? (allBillsTotalAmount / income) * 100 : 0;

  // --- Paycheck History (for charts/display) ---
  const paycheckHistory = statements.slice(-6).map(s => ({
    period: s.pay_period_start,
    income: s.total_income,
  }));

  // --- Unique bill accounts for display ---
  const uniqueBills = [];
  const seenAccounts = new Set();
  for (const stmt of allStatements) {
    if (!seenAccounts.has(stmt.accountName)) {
      seenAccounts.add(stmt.accountName);
      uniqueBills.push({
        name: stmt.accountName,
        type: stmt.accountType,
        latestAmount: stmt.statementData?.amountDue || 0,
      });
    }
  }

  return {
    income,
    incomeThisMonth,
    incomeLastMonth,
    incomeTrend,
    tdi,
    totalAmountDue: allBillsTotalAmount,
    overdueBillsCount: overdueBills.length,
    budgetHealth,
    totalBudget,
    totalSpent,
    remainingBudget,
    salaryBillRatio,
    paycheckHistory,
    uniqueBills,
    allBudgets: snapshot.budgets?.allBudgets || [],
    allBillsThisPeriod,
  };
}

/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Main hook.
 */
export function useFinancialData(employeeId) {
  const [rawSnapshot, setRawSnapshot] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNoData, setHasNoData] = useState(false);

  useEffect(() => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setHasNoData(false);

      const result = await fetchSnapshot(employeeId);

      if (cancelled) return;

      if (result.error) {
        if (result.error === 'NO_DATA') {
          setHasNoData(true);
        } else {
          setError(result.error);
        }
        setIsLoading(false);
        return;
      }

      const snapshot = result.data?.snapshot;
      if (!snapshot) {
        setHasNoData(true);
        setIsLoading(false);
        return;
      }

      setRawSnapshot(snapshot);
      setMetrics(deriveMetrics(snapshot));
      setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [employeeId]);

  // Wrapper around the chatbot API
  const askSherpaQuestion = useCallback(async (question) => {
    return askSherpa(question, employeeId);
  }, [employeeId]);

  return {
    rawSnapshot,
    metrics,
    isLoading,
    error,
    hasNoData,
    askSherpa: askSherpaQuestion,
  };
}
