import type {
  Account,
  AccountHierarchy,
  ChartOfAccount,
  CreateAccountInput,
  CreateTransactionInput,
  LedgerPosting,
  ReconcileStatus,
  RegisterEntry,
  Transaction,
  UpdateAccountInput
} from "@/modules/accounting/domain/models";
import type {
  AccountService,
  LedgerService,
  RegisterService,
  ServiceContainer,
  TransactionService
} from "@/modules/accounting/application/contracts";

const ACCOUNT_TYPE_BY_CATEGORY: Record<Account["category"], ChartOfAccount["accountType"]> = {
  ACCOUNTS_RECEIVABLE: "ASSET",
  BANK: "ASSET",
  CREDIT_CARD: "LIABILITY",
  EQUITY: "EQUITY",
  EXPENSE: "EXPENSE",
  FIXED_ASSET: "ASSET",
  INCOME: "REVENUE",
  LONG_TERM_LIABILITY: "LIABILITY",
  OTHER_CURRENT_ASSET: "ASSET",
  OTHER_CURRENT_LIABILITY: "LIABILITY",
  OTHER_EXPENSE: "EXPENSE",
  OTHER_INCOME: "REVENUE"
};

const NORMAL_BALANCE_BY_TYPE: Record<ChartOfAccount["accountType"], ChartOfAccount["normalBalance"]> = {
  ASSET: "DEBIT",
  LIABILITY: "CREDIT",
  EQUITY: "CREDIT",
  REVENUE: "CREDIT",
  EXPENSE: "DEBIT"
};

function toChartAccount(account: Account): ChartOfAccount {
  const accountType = ACCOUNT_TYPE_BY_CATEGORY[account.category];
  return {
    id: account.id,
    accountNumber: account.code,
    name: account.name,
    accountType,
    accountSubtype: account.subtype,
    normalBalance: NORMAL_BALANCE_BY_TYPE[accountType],
    isParent: false,
    isSystemAccount: false,
    allowsManualPostings: account.allowManualEntries,
    currency: account.currency,
    openingBalance: account.openingBalance ?? 0,
    currentBalance: account.currentBalance,
    availableBalance: account.currentBalance,
    status: account.status,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt
  };
}

type ApiError = { error: string };

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = (await response.json()) as ApiError;
      if (payload.error) message = payload.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

class HttpAccountService implements AccountService {
  constructor(private readonly baseUrl: string) {}

  createAccount(input: CreateAccountInput): Promise<Account> {
    return request(this.baseUrl, "/accounts", { method: "POST", body: JSON.stringify(input) });
  }

  updateAccount(id: string, input: UpdateAccountInput): Promise<Account> {
    return request(this.baseUrl, `/accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  }

  async closeAccount(id: string): Promise<void> {
    await request(this.baseUrl, `/accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "CLOSED" })
    });
  }

  getAccountById(id: string): Promise<Account> {
    return request(this.baseUrl, `/accounts/${id}`);
  }

  listAccounts(): Promise<Account[]> {
    return request(this.baseUrl, "/accounts");
  }

  async getAccountHierarchy(): Promise<AccountHierarchy> {
    const accounts = await this.listAccounts();
    const chartAccounts = accounts.map(toChartAccount);
    return chartAccounts.map((account) => ({
      ...account,
      children: chartAccounts.filter((candidate) => candidate.parentAccountId === account.id)
    }));
  }
}

class HttpTransactionService implements TransactionService {
  constructor(private readonly baseUrl: string) {}

  createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    return request(this.baseUrl, "/transactions", { method: "POST", body: JSON.stringify(input) });
  }

  getTransactionById(id: string): Promise<Transaction> {
    return request(this.baseUrl, `/transactions/${id}`);
  }

  listTransactions(): Promise<Transaction[]> {
    return request(this.baseUrl, "/transactions");
  }

  postTransaction(id: string): Promise<Transaction> {
    return request(this.baseUrl, `/transactions/${id}/post`, { method: "POST" });
  }

  voidTransaction(id: string): Promise<Transaction> {
    return request(this.baseUrl, `/transactions/${id}/void`, { method: "POST" });
  }

  reverseTransaction(id: string): Promise<Transaction> {
    return request(this.baseUrl, `/transactions/${id}/reverse`, { method: "POST" });
  }

  createDeposit(input: Omit<CreateTransactionInput, "type">): Promise<Transaction> {
    return request(this.baseUrl, "/deposits", { method: "POST", body: JSON.stringify(input) });
  }

  createTransfer(input: Omit<CreateTransactionInput, "type">): Promise<Transaction> {
    return request(this.baseUrl, "/transfers", { method: "POST", body: JSON.stringify(input) });
  }
}

class HttpLedgerService implements LedgerService {
  constructor(private readonly baseUrl: string) {}

  getPostingsByTransactionId(transactionId: string): Promise<LedgerPosting[]> {
    return request(this.baseUrl, `/ledger/transactions/${transactionId}/postings`);
  }

  listPostings(): Promise<LedgerPosting[]> {
    return request(this.baseUrl, "/ledger/postings");
  }
}

class HttpRegisterService implements RegisterService {
  constructor(private readonly baseUrl: string) {}

  listRegisterEntries(accountId: string): Promise<RegisterEntry[]> {
    return request(this.baseUrl, `/accounts/${accountId}/register`);
  }

  getTransactionDetail(transactionId: string): Promise<{
    transaction: Transaction;
    postings: LedgerPosting[];
    registerEntries: RegisterEntry[];
  }> {
    return request(this.baseUrl, `/transactions/${transactionId}/detail`);
  }

  updateRegisterEntry(
    entryId: string,
    input: Pick<RegisterEntry, "date" | "refNumber" | "payee" | "memo"> & {
      payment?: number;
      deposit?: number;
      reconcileStatus?: ReconcileStatus;
      counterpartyAccountId?: string;
    }
  ): Promise<RegisterEntry> {
    return request(this.baseUrl, `/register/${entryId}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  }

  setReconcileStatus(entryId: string, status: ReconcileStatus): Promise<RegisterEntry> {
    return request(this.baseUrl, `/register/${entryId}/reconcile`, {
      method: "POST",
      body: JSON.stringify({ status })
    });
  }

  deleteRegisterEntry(entryId: string): Promise<RegisterEntry> {
    return request(this.baseUrl, `/register/${entryId}`, { method: "DELETE" });
  }
}

export function createHttpServiceContainer(baseUrl: string): ServiceContainer {
  const normalized = baseUrl.replace(/\/$/, "");
  return {
    accountService: new HttpAccountService(normalized),
    transactionService: new HttpTransactionService(normalized),
    ledgerService: new HttpLedgerService(normalized),
    registerService: new HttpRegisterService(normalized)
  };
}

/** Reads NEXT_PUBLIC_API_URL from ui/.env (loaded by Next.js at build/dev time). */
export function resolveApiBaseUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) return null;
  return configured.replace(/\/$/, "");
}