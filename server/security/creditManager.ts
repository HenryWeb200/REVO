import { getSupabaseAdminClient } from '../database/supabase.js';

export const CREDIT_COSTS = {
  ANALYSIS: 10,
  ASK_REVO: 2,
  COMPARE: 3,
  WATCH_RUN: 5,
} as const;

export type CreditOperation = keyof typeof CREDIT_COSTS;

export const DEFAULT_INITIAL_CREDITS = 100;

interface CreditAccount {
  ownerId: string;
  balance: number;
  lastUpdated: number;
}

interface ProcessedTransaction {
  timestamp: number;
  operation: CreditOperation;
  cost: number;
  balanceAfter: number;
}

// In-memory credit accounts & idempotency cache
const creditAccounts = new Map<string, CreditAccount>();
const idempotencyStore = new Map<string, ProcessedTransaction>();
const activeLocks = new Set<string>();

/**
 * Normalizes an ownerId or defaults to "guest_default"
 */
function normalizeOwnerId(ownerId?: string): string {
  if (!ownerId || typeof ownerId !== 'string' || ownerId.trim().length === 0) {
    return 'guest_default';
  }
  return ownerId.trim().toLowerCase();
}

/**
 * Gets or initializes a credit balance for a given owner.
 */
export function getUserCredits(ownerId?: string): number {
  const id = normalizeOwnerId(ownerId);
  let account = creditAccounts.get(id);
  if (!account) {
    account = {
      ownerId: id,
      balance: DEFAULT_INITIAL_CREDITS,
      lastUpdated: Date.now(),
    };
    creditAccounts.set(id, account);
  }
  return account.balance;
}

/**
 * Checks if a user has sufficient credits for an operation without deducting.
 */
export function hasEnoughCredits(ownerId: string | undefined, operation: CreditOperation): boolean {
  const currentBalance = getUserCredits(ownerId);
  const cost = CREDIT_COSTS[operation] || 1;
  return currentBalance >= cost;
}

/**
 * Atomically deducts credits for an operation.
 * Supports idempotency keys to prevent double-deduction on retried requests.
 */
export function deductCreditsAtomic(
  ownerId: string | undefined,
  operation: CreditOperation,
  idempotencyKey?: string
): { success: boolean; balance: number; cost: number; error?: string; reused?: boolean } {
  const id = normalizeOwnerId(ownerId);
  const cost = CREDIT_COSTS[operation] || 1;

  // 1. Idempotency Check: if request key was already processed, return previous transaction without re-deducting
  if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0) {
    const cleanKey = `${id}:${idempotencyKey.trim()}`;
    const previous = idempotencyStore.get(cleanKey);
    if (previous) {
      console.log(`[REVO CreditManager] Idempotent request detected key=${cleanKey}. Reusing previous transaction.`);
      return {
        success: true,
        balance: previous.balanceAfter,
        cost: previous.cost,
        reused: true,
      };
    }
  }

  // 2. Concurrency Lock: prevent race conditions spending the same balance simultaneously
  const lockKey = `lock:${id}`;
  if (activeLocks.has(lockKey)) {
    // If locked, perform strict current balance check
    const current = getUserCredits(id);
    if (current < cost) {
      return {
        success: false,
        balance: current,
        cost,
        error: `Insufficient credits. Required: ${cost}, Available: ${current}`,
      };
    }
  }

  activeLocks.add(lockKey);
  try {
    const currentBalance = getUserCredits(id);
    if (currentBalance < cost) {
      return {
        success: false,
        balance: currentBalance,
        cost,
        error: `Insufficient credits for ${operation}. Required: ${cost}, Available: ${currentBalance}. Please top up your account balance.`,
      };
    }

    const newBalance = currentBalance - cost;
    const account = creditAccounts.get(id) || { ownerId: id, balance: DEFAULT_INITIAL_CREDITS, lastUpdated: Date.now() };
    account.balance = newBalance;
    account.lastUpdated = Date.now();
    creditAccounts.set(id, account);

    // Save idempotency transaction
    if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0) {
      const cleanKey = `${id}:${idempotencyKey.trim()}`;
      idempotencyStore.set(cleanKey, {
        timestamp: Date.now(),
        operation,
        cost,
        balanceAfter: newBalance,
      });

      // Maintain max store size
      if (idempotencyStore.size > 2000) {
        const oldestKey = idempotencyStore.keys().next().value;
        if (oldestKey) idempotencyStore.delete(oldestKey);
      }
    }

    console.log(`[REVO CreditManager] operation=${operation} owner=${id} cost=${cost} newBalance=${newBalance}`);

    return {
      success: true,
      balance: newBalance,
      cost,
    };
  } finally {
    activeLocks.delete(lockKey);
  }
}

/**
 * Refunds credits if an operation failed before consuming paid resources (e.g. target unreachable / invalid URL).
 */
export function refundCredits(
  ownerId: string | undefined,
  amount: number,
  reason: string
): number {
  const id = normalizeOwnerId(ownerId);
  const account = creditAccounts.get(id) || { ownerId: id, balance: DEFAULT_INITIAL_CREDITS, lastUpdated: Date.now() };
  account.balance += Math.max(0, amount);
  account.lastUpdated = Date.now();
  creditAccounts.set(id, account);

  console.log(`[REVO CreditManager] REFUND owner=${id} amount=${amount} newBalance=${account.balance} reason="${reason}"`);
  return account.balance;
}

/**
 * Adds credits to a user balance.
 */
export function topUpCredits(ownerId: string | undefined, amount: number, reason: string): number {
  const id = normalizeOwnerId(ownerId);
  const account = creditAccounts.get(id) || { ownerId: id, balance: DEFAULT_INITIAL_CREDITS, lastUpdated: Date.now() };
  account.balance += Math.max(0, amount);
  account.lastUpdated = Date.now();
  creditAccounts.set(id, account);

  console.log(`[REVO CreditManager] TOPUP owner=${id} amount=${amount} newBalance=${account.balance} reason="${reason}"`);
  return account.balance;
}
