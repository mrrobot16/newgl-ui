import type { Account, LedgerPosting } from "@/modules/accounting/domain/models";
import { DEBIT_NORMAL_CATEGORIES } from "@/modules/accounting/domain/accounting-reports";

export type DrillTransaction = {
  transactionId: string;
  date: string;
  memo: string;
  referenceNumber: string;
  amount: number; // signed: same convention as report rows (positive = normal-side)
};

function signedAmount(account: Account, posting: LedgerPosting): number {
  if (DEBIT_NORMAL_CATEGORIES.has(account.category)) {
    return posting.entryType === "DEBIT" ? posting.amount : -posting.amount;
  }
  return posting.entryType === "CREDIT" ? posting.amount : -posting.amount;
}

/**
 * Derives the transaction list for a specific account name from already-loaded
 * postings — no additional API calls needed for Level 2 drill-down.
 *
 * @param accountName  Matches Account.name (the human-readable name stored in
 *                     Beancount metadata, e.g. "Medical Expenses:Bloodwork visit").
 * @param postings     All loaded LedgerPostings (from ledgerService.listPostings).
 * @param accounts     All loaded Accounts (from accountService.listAccounts).
 * @param fromDate     ISO date string, inclusive lower bound ("" = no limit).
 * @param toDate       ISO date string, inclusive upper bound ("" = no limit).
 */
export function getTransactionsForAccount(
  accountName: string,
  postings: LedgerPosting[],
  accounts: Account[],
  fromDate: string,
  toDate: string
): DrillTransaction[] {
  const accountMap = new Map<string, Account>();
  for (const a of accounts) accountMap.set(a.id, a);

  const matchingIds = new Set(
    accounts.filter((a) => a.name === accountName).map((a) => a.id)
  );
  if (matchingIds.size === 0) return [];

  const relevant = postings.filter(
    (p) =>
      p.status === "POSTED" &&
      matchingIds.has(p.accountId) &&
      (!fromDate || p.postingDate >= fromDate) &&
      (!toDate || p.postingDate <= toDate)
  );

  const byTxn = new Map<string, LedgerPosting[]>();
  for (const p of relevant) {
    const list = byTxn.get(p.transactionId) ?? [];
    list.push(p);
    byTxn.set(p.transactionId, list);
  }

  return [...byTxn.entries()]
    .map(([transactionId, txnPostings]) => {
      const account = accountMap.get(txnPostings[0].accountId);
      const total = txnPostings.reduce(
        (sum, p) => sum + (account ? signedAmount(account, p) : p.amount),
        0
      );
      return {
        transactionId,
        date: txnPostings[0].postingDate,
        memo: txnPostings[0].memo ?? "",
        referenceNumber: txnPostings[0].referenceNumber ?? "",
        amount: total,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
