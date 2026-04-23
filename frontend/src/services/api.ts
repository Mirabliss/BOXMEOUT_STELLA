// ============================================================
// BOXMEOUT — API Service
// Typed wrappers around the backend REST endpoints.
// Base URL is set from NEXT_PUBLIC_API_URL env variable.
// Contributors: implement every function marked TODO.
// ============================================================

import type {
  Bet,
  Market,
  MarketStats,
  Portfolio,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface MarketFilters {
  status?: string;
  weight_class?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface MarketListResponse {
  markets: Market[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Calls GET /api/markets with optional filters and pagination.
 * Returns typed MarketListResponse.
 * Throws NetworkError if the request fails.
 */
export async function fetchMarkets(
  filters?: MarketFilters,
  pagination?: PaginationParams,
): Promise<MarketListResponse> {
  // TODO: implement
}

/**
 * Calls GET /api/markets/:market_id.
 * Returns the Market including live odds.
 * Throws NotFoundError on 404.
 */
export async function fetchMarketById(market_id: string): Promise<Market> {
  // TODO: implement
}

/**
 * Calls GET /api/markets/:market_id/bets.
 * Returns all bets for the market.
 */
export async function fetchBetsByMarket(market_id: string): Promise<Bet[]> {
  // TODO: implement
}

/**
 * Calls GET /api/portfolio/:address.
 * Returns the full Portfolio object.
 */
export async function fetchPortfolio(address: string): Promise<Portfolio> {
  const res = await fetch(`${API_BASE}/api/portfolio/${address}`);
  if (!res.ok) throw new Error(`fetchPortfolio failed: ${res.status}`);
  return res.json();
}

/**
 * Calls GET /api/markets/:market_id/stats.
 * Returns aggregate MarketStats.
 */
export async function fetchMarketStats(
  market_id: string,
): Promise<MarketStats> {
  // TODO: implement
}
