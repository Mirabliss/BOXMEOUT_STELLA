# Prediction Market Contract — GitHub Issues

> Copy each block below to create a GitHub issue.
> Create these labels first before applying them.
>
> | Label | Color | Description |
> |---|---|---|
> | `smart-contract` | `#0075ca` | Soroban / Stellar contract work |
> | `prediction-market` | `#e4e669` | Prediction market domain |
> | `feature` | `#a2eeef` | New functionality |
> | `admin` | `#d93f0b` | Admin / governance functions |
> | `roles` | `#b60205` | Role-based access control |
> | `amm` | `#0e8a16` | AMM / CPMM pricing logic |
> | `liquidity` | `#006b75` | Liquidity provider functions |
> | `trading` | `#f9d0c4` | Buy / sell / split / merge |
> | `oracle` | `#5319e7` | Oracle & dispute resolution |
> | `settlement` | `#1d76db` | Position redemption & refunds |
> | `query` | `#bfd4f2` | Read-only view functions |
> | `math` | `#fbca04` | Fixed-point arithmetic helpers |
> | `events` | `#e4e669` | Contract event emitters |
> | `security` | `#ee0701` | Security-critical logic |
> | `good first issue` | `#7057ff` | Suitable for newcomers |
> | `testing` | `#0075ca` | Test suites |

---

## Issue #1 — `initialize`

**Title:** `[Contract] Implement initialize — bootstrap global configuration`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`, `security`

**Description:**
One-time contract bootstrap. Sets all global config: admin, treasury, oracle, token, fees, limits, and dispute bond.

**Acceptance Criteria:**
- [ ] Rejects double-initialisation (`AlreadyInitialized`).
- [ ] Validates total fee bps ≤ 10 000.
- [ ] Validates `min_liquidity`, `min_trade`, `max_outcomes` are sensible positive values.
- [ ] Persists `Config` to `DataKey::Config`.
- [ ] Seeds `NextMarketId = 1` and `EmergencyPause = false`.
- [ ] Emits `events::initialized`.
- [ ] Unit test: second call is rejected.

**File:** `src/prediction_market.rs` → `fn initialize`

---

## Issue #2 — `update_admin`

**Title:** `[Contract] Implement update_admin — transfer superadmin rights`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`, `security`

**Description:**
Allows the current superadmin to transfer control to a new address.

**Acceptance Criteria:**
- [ ] Requires current admin auth.
- [ ] Rejects calls from non-admin addresses.
- [ ] Loads `Config`, replaces `admin`, persists.
- [ ] Emits `events::admin_updated`.
- [ ] Unit test: new admin can act; old admin cannot.

**File:** `src/prediction_market.rs` → `fn update_admin`

---

## Issue #3 — `update_fee_config`

**Title:** `[Contract] Implement update_fee_config — update protocol/LP/creator fee split`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`

**Description:**
Allows admin to adjust the three-way fee split applied to all new trades.

**Acceptance Criteria:**
- [ ] Requires admin auth.
- [ ] Rejects if total bps > 10 000 (`FeesTooHigh`).
- [ ] Persists updated `FeeConfig` in `Config`.
- [ ] Emits `events::fee_config_updated`.

**File:** `src/prediction_market.rs` → `fn update_fee_config`

---

## Issue #4 — `set_treasury`

**Title:** `[Contract] Implement set_treasury — update protocol treasury address`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`

**Description:**
Updates where protocol fees are sent.

**Acceptance Criteria:**
- [ ] Requires admin auth.
- [ ] Persists new treasury in `Config`.
- [ ] Emits `events::treasury_updated`.

**File:** `src/prediction_market.rs` → `fn set_treasury`

---

## Issue #5 — `update_dispute_bond`

**Title:** `[Contract] Implement update_dispute_bond — set minimum dispute bond`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`, `oracle`

**Description:**
Adjusts the bond required to file a dispute against an oracle report.

**Acceptance Criteria:**
- [ ] Requires admin auth.
- [ ] Validates `new_bond > 0`.
- [ ] Persists in `Config`.

**File:** `src/prediction_market.rs` → `fn update_dispute_bond`

---

## Issue #6 — `emergency_pause` / `emergency_unpause`

**Title:** `[Contract] Implement emergency_pause and emergency_unpause — global circuit breaker`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`, `security`

**Description:**
Freezes / unfreezes ALL state-mutating calls across the entire contract. Every mutating function must check this flag first.

**Acceptance Criteria:**
- [ ] Requires admin auth for both.
- [ ] Sets `DataKey::EmergencyPause` and `Config.emergency_paused`.
- [ ] All state-mutating functions return `EmergencyPaused` when flag is true.
- [ ] Emits `events::emergency_paused` / `events::emergency_unpaused`.
- [ ] Unit test: pause → buy_shares is rejected → unpause → buy_shares succeeds.

**File:** `src/prediction_market.rs` → `fn emergency_pause`, `fn emergency_unpause`

---

## Issue #7 — `grant_operator` / `revoke_operator` / `is_operator`

**Title:** `[Contract] Implement operator role management`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `roles`, `security`

**Description:**
Operators can create markets, update metadata, and pause individual markets — without being the superadmin.

**Acceptance Criteria:**
- [ ] `grant_operator`: requires admin auth; sets `DataKey::IsOperator(address) = true`; emits event.
- [ ] `revoke_operator`: requires admin auth; removes or sets false; emits event.
- [ ] `is_operator`: pure read, returns bool.
- [ ] Functions that require operator-or-admin access use a shared helper `assert_admin_or_operator`.
- [ ] Unit tests: non-admin cannot grant; operator can create markets; revoked operator cannot.

**File:** `src/prediction_market.rs` → `fn grant_operator`, `fn revoke_operator`, `fn is_operator`

---

## Issue #8 — `create_market`

**Title:** `[Contract] Implement create_market — create a new prediction market with full metadata`

**Tags:** `smart-contract`, `prediction-market`, `feature`

**Description:**
Creates a market in `Initializing` state. It only opens for trading after `seed_market` provides initial AMM liquidity.

**Acceptance Criteria:**
- [ ] Requires admin or operator auth.
- [ ] Validates `betting_close_time > now` and `resolution_deadline > betting_close_time`.
- [ ] Validates `resolution_deadline - now <= Config.max_market_duration_secs`.
- [ ] Validates at least 2 and at most `Config.max_outcomes` unique outcome labels.
- [ ] Validates `dispute_window_secs >= 3600`.
- [ ] Validates metadata field lengths.
- [ ] Auto-increments `NextMarketId`.
- [ ] Initialises `MarketStats` with all zeros.
- [ ] Market starts in `Initializing` status.
- [ ] Emits `events::market_created`.
- [ ] Returns `market_id`.

**File:** `src/prediction_market.rs` → `fn create_market`

---

## Issue #9 — `update_market_metadata`

**Title:** `[Contract] Implement update_market_metadata — update category, tags, image, description`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `good first issue`

**Description:**
Admin, operators, and the market creator can update display metadata.

**Acceptance Criteria:**
- [ ] Requires admin, operator, or creator auth.
- [ ] Validates market is not Resolved or Cancelled.
- [ ] Validates field lengths.
- [ ] Persists updated metadata inside `Market`.
- [ ] Emits `events::market_metadata_updated`.

**File:** `src/prediction_market.rs` → `fn update_market_metadata`

---

## Issue #10 — `set_market_oracle`

**Title:** `[Contract] Implement set_market_oracle — per-market oracle override`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`, `oracle`

**Description:**
Sets a market-specific oracle that overrides the global default.

**Acceptance Criteria:**
- [ ] Requires admin auth.
- [ ] Market must not be Resolved or Cancelled.
- [ ] Persists `DataKey::MarketOracle(market_id)`.
- [ ] Emits `events::market_oracle_set`.

**File:** `src/prediction_market.rs` → `fn set_market_oracle`

---

## Issue #11 — `pause_market` / `resume_market`

**Title:** `[Contract] Implement pause_market and resume_market — per-market trading halt`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`

**Description:**
Admin or operator can temporarily halt trading on a specific market.

**Acceptance Criteria:**
- [ ] Both check global emergency pause.
- [ ] `pause_market`: validates status is `Open`; sets `Paused`.
- [ ] `resume_market`: validates status is `Paused`; validates `betting_close_time > now`.
- [ ] Both require admin or operator auth.
- [ ] Both emit appropriate events.
- [ ] Unit test: pause → `buy_shares` rejected; resume → `buy_shares` succeeds.

**File:** `src/prediction_market.rs` → `fn pause_market`, `fn resume_market`

---

## Issue #12 — `close_betting`

**Title:** `[Contract] Implement close_betting — manually close the betting window early`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`

**Description:**
Closes the betting window early, allowing the oracle to report before the original deadline.

**Acceptance Criteria:**
- [ ] Requires admin or operator auth.
- [ ] Market must be `Open` or `Paused`.
- [ ] Sets `status = Closed`.
- [ ] Emits `events::market_closed`.

**File:** `src/prediction_market.rs` → `fn close_betting`

---

## Issue #13 — `cancel_market`

**Title:** `[Contract] Implement cancel_market — cancel market and enable refunds`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`

**Description:**
Cancels a market at any non-final state. All position holders can claim full collateral refunds.

**Acceptance Criteria:**
- [ ] Requires admin auth.
- [ ] Rejects if already Resolved or Cancelled.
- [ ] Sets `status = Cancelled`.
- [ ] Does NOT move funds (users call `refund_position`).
- [ ] Emits `events::market_cancelled`.

**File:** `src/prediction_market.rs` → `fn cancel_market`

---

## Issue #14 — `seed_market`

**Title:** `[Contract] Implement seed_market — initial AMM liquidity seeding`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `amm`, `liquidity`, `security`

**Description:**
Seeds the CPMM pool with initial collateral, setting equal reserves for all outcomes and opening the market for trading.

**Acceptance Criteria:**
- [ ] Only callable by the market creator; market must be `Initializing`.
- [ ] `collateral >= Config.min_liquidity`.
- [ ] Calls `amm::calc_initial_reserves` and `amm::calc_initial_lp_shares`.
- [ ] Initialises `AmmPool` with computed reserves and invariant k.
- [ ] Mints LP shares to the provider; creates `LpPosition`.
- [ ] Sets `market.status = Open`.
- [ ] Emits `events::market_seeded`.
- [ ] Returns LP shares minted.
- [ ] Unit test: initial price of each outcome ≈ 1/n outcomes.

**File:** `src/prediction_market.rs` → `fn seed_market`

---

## Issue #15 — `add_liquidity`

**Title:** `[Contract] Implement add_liquidity — add collateral to an open pool`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `liquidity`

**Description:**
Any address can add liquidity to an open market pool, receiving LP shares proportional to their contribution.

**Acceptance Criteria:**
- [ ] Checks global pause; requires provider auth.
- [ ] Market must be `Open`; `collateral > 0`.
- [ ] Calls `amm::calc_lp_shares_to_mint`.
- [ ] Adds collateral proportionally across all reserves (preserving prices).
- [ ] Recomputes `invariant_k`.
- [ ] Creates/updates `LpPosition`; snapshots `LpFeeDebt`.
- [ ] Emits `events::liquidity_added`.

**File:** `src/prediction_market.rs` → `fn add_liquidity`

---

## Issue #16 — `remove_liquidity`

**Title:** `[Contract] Implement remove_liquidity — withdraw LP collateral by burning shares`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `liquidity`

**Description:**
LP providers burn their LP shares to withdraw proportional collateral from the pool.

**Acceptance Criteria:**
- [ ] Checks global pause; requires provider auth.
- [ ] Validates position exists and `lp_shares_to_burn <= position.lp_shares`.
- [ ] Enforces locking rule (only after `betting_close_time` or when Resolved/Cancelled).
- [ ] Calls `amm::calc_collateral_from_lp`.
- [ ] Reduces reserves proportionally; recomputes k.
- [ ] Burns LP shares; removes key if position reaches 0.
- [ ] Emits `events::liquidity_removed`.

**File:** `src/prediction_market.rs` → `fn remove_liquidity`

---

## Issue #17 — `claim_lp_fees`

**Title:** `[Contract] Implement claim_lp_fees — LP provider collects trading fees`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `liquidity`

**Description:**
Uses the dividend-per-share pattern so LPs can claim their accumulated share of trading fees at any time.

**Acceptance Criteria:**
- [ ] Requires provider auth.
- [ ] Calls `math::calc_claimable_lp_fees(lp_shares, LpFeePerShare, LpFeeDebt)`.
- [ ] Returns `NoFeesToCollect` if claimable == 0.
- [ ] Transfers fees to provider; updates `LpFeeDebt`.
- [ ] Emits `events::lp_fees_claimed`.
- [ ] Unit test: two LPs with different share sizes receive proportional fees.

**File:** `src/prediction_market.rs` → `fn claim_lp_fees`

---

## Issue #18 — `collect_protocol_fees`

**Title:** `[Contract] Implement collect_protocol_fees — treasury claims protocol fees`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`

**Description:**
Admin sends accumulated protocol fees from a settled market to the treasury.

**Acceptance Criteria:**
- [ ] Requires admin auth.
- [ ] Market must be Resolved or Cancelled.
- [ ] Returns `NoFeesToCollect` if pool is 0.
- [ ] Transfers to `Config.treasury`; zeroes pool.
- [ ] Emits `events::protocol_fees_collected`.

**File:** `src/prediction_market.rs` → `fn collect_protocol_fees`

---

## Issue #19 — `collect_creator_fees`

**Title:** `[Contract] Implement collect_creator_fees — market creator claims their fees`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `good first issue`

**Description:**
The market creator collects their share of fees after the market settles.

**Acceptance Criteria:**
- [ ] Requires market creator auth.
- [ ] Market must be Resolved or Cancelled.
- [ ] Transfers `creator_fee_pool`; zeroes it.
- [ ] Emits `events::creator_fees_collected`.

**File:** `src/prediction_market.rs` → `fn collect_creator_fees`

---

## Issue #20 — `buy_shares`

**Title:** `[Contract] Implement buy_shares — CPMM share purchase with fee split and slippage guard`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `amm`, `trading`, `security`

**Description:**
Core trading function. User spends collateral to buy outcome shares via the CPMM. Price moves against them (higher demand = higher price).

**Acceptance Criteria:**
- [ ] Checks global pause; requires buyer auth.
- [ ] Market must be `Open`; `now < betting_close_time`.
- [ ] Validates `outcome_id` and `collateral_in >= Config.min_trade`.
- [ ] Calls `math::split_fees` to compute three fee amounts.
- [ ] Calls `amm::calc_buy_shares` on `net_collateral` (after fees).
- [ ] Enforces `shares_out >= min_shares_out` (slippage guard).
- [ ] Calls `amm::update_reserves_buy`.
- [ ] Distributes fees: protocol → `protocol_fee_pool`, creator → `creator_fee_pool`, LP → `LpFeePerShare` accumulator.
- [ ] Updates `UserPosition` and `UserMarketPositions`.
- [ ] Updates `MarketStats` (volume, traders, last_trade_at).
- [ ] Emits `events::shares_bought`.
- [ ] Returns `TradeReceipt`.
- [ ] Unit tests: slippage exceeded, buy below minimum, buy on closed market.

**File:** `src/prediction_market.rs` → `fn buy_shares`

---

## Issue #21 — `sell_shares`

**Title:** `[Contract] Implement sell_shares — CPMM share sale with fee split and slippage guard`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `amm`, `trading`, `security`

**Description:**
Users can exit their position before resolution by selling shares back to the AMM at the current market price.

**Acceptance Criteria:**
- [ ] Checks global pause; requires seller auth.
- [ ] Market must be `Open`; `now < betting_close_time`.
- [ ] Validates position exists and `shares_in <= position.shares`.
- [ ] Calls `amm::calc_sell_collateral` → gross collateral.
- [ ] Deducts fees; enforces `net_collateral_out >= min_collateral_out`.
- [ ] Calls `amm::update_reserves_sell`.
- [ ] Distributes fees same as buy.
- [ ] Updates position (removes key if shares reach 0).
- [ ] Emits `events::shares_sold`.
- [ ] Returns `TradeReceipt`.
- [ ] Unit tests: sell more than held is rejected; slippage guard; double-sell after zeroing.

**File:** `src/prediction_market.rs` → `fn sell_shares`

---

## Issue #22 — `split_position`

**Title:** `[Contract] Implement split_position — mint complete set of outcome shares`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `trading`

**Description:**
Splits 1 unit of collateral into 1 share of every outcome. No AMM interaction. Always a 1:1 value trade (no price impact, no fee).

**Acceptance Criteria:**
- [ ] Checks global pause; requires caller auth.
- [ ] Market must be `Open`.
- [ ] Validates `collateral > 0`.
- [ ] Transfers collateral from caller to contract.
- [ ] Mints 1 share of every outcome to caller.
- [ ] Updates `total_shares_outstanding` for each outcome.
- [ ] Emits `events::position_split`.
- [ ] Unit test: split → merge returns original collateral.

**File:** `src/prediction_market.rs` → `fn split_position`

---

## Issue #23 — `merge_positions`

**Title:** `[Contract] Implement merge_positions — burn complete set to reclaim collateral`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `trading`

**Description:**
Inverse of `split_position`. Burns 1 share of every outcome to reclaim 1 unit of collateral. No fee.

**Acceptance Criteria:**
- [ ] Checks global pause; requires caller auth.
- [ ] Validates caller holds >= `shares` of EVERY outcome.
- [ ] Burns shares from all outcome positions; removes empty keys.
- [ ] Transfers `shares` collateral to caller.
- [ ] Emits `events::position_merged`.
- [ ] Unit test: holding incomplete set is rejected.

**File:** `src/prediction_market.rs` → `fn merge_positions`

---

## Issue #24 — `report_outcome`

**Title:** `[Contract] Implement report_outcome — oracle submits proposed resolution (phase 1)`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `oracle`, `security`

**Description:**
Two-phase resolution phase 1. Oracle proposes a winner, starting the dispute window.

**Acceptance Criteria:**
- [ ] Resolves oracle address from `DataKey::MarketOracle` or `Config.default_oracle`.
- [ ] Requires oracle auth.
- [ ] Market must be `Closed` or `Open` with `betting_close_time` elapsed.
- [ ] `now >= resolution_deadline`.
- [ ] Validates `proposed_outcome_id`.
- [ ] Persists `OracleReport`; sets `market.status = Reported`.
- [ ] Emits `events::outcome_reported`.
- [ ] Unit test: report before deadline rejected; invalid outcome rejected.

**File:** `src/prediction_market.rs` → `fn report_outcome`

---

## Issue #25 — `dispute_outcome`

**Title:** `[Contract] Implement dispute_outcome — bond-backed challenge to oracle report`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `oracle`, `security`

**Description:**
Any user can challenge the oracle's proposed outcome by locking a bond. Only one active dispute per market.

**Acceptance Criteria:**
- [ ] Checks global pause; requires disputer auth.
- [ ] Market must be `Reported`.
- [ ] `now < report.reported_at + market.dispute_window_secs`.
- [ ] `proposed_outcome_id` must differ from oracle's proposal.
- [ ] No existing dispute (`DisputeAlreadyExists`).
- [ ] `bond >= Config.dispute_bond`.
- [ ] Transfers bond from disputer to contract.
- [ ] Persists `Dispute`; marks `report.disputed = true`.
- [ ] Emits `events::outcome_disputed`.
- [ ] Unit test: dispute after window expired is rejected; duplicate dispute rejected.

**File:** `src/prediction_market.rs` → `fn dispute_outcome`

---

## Issue #26 — `resolve_dispute`

**Title:** `[Contract] Implement resolve_dispute — admin rules on a dispute`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `oracle`, `admin`, `security`

**Description:**
Admin reviews the dispute and either upholds it (bond returned, resolution overruled) or rejects it (bond slashed to treasury).

**Acceptance Criteria:**
- [ ] Requires admin auth.
- [ ] Market must be `Reported` with an active `Pending` dispute.
- [ ] Upheld: refund bond to disputer; if `final_outcome_id` provided, finalise; else reset to `Closed`.
- [ ] Rejected: slash bond to treasury.
- [ ] Updates dispute status and persists.
- [ ] Emits `events::dispute_resolved`.
- [ ] Unit tests: upheld with override finalises; rejected slashes bond.

**File:** `src/prediction_market.rs` → `fn resolve_dispute`

---

## Issue #27 — `finalize_resolution`

**Title:** `[Contract] Implement finalize_resolution — permissionless finalisation after dispute window`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `oracle`

**Description:**
Once the dispute window passes with no active dispute, anyone can call this to lock in the oracle's result.

**Acceptance Criteria:**
- [ ] Market must be `Reported`.
- [ ] `report.disputed == false`.
- [ ] `now >= report.reported_at + dispute_window_secs`.
- [ ] Sets `winning_outcome_id`; computes and stores all three fee pools.
- [ ] Accumulates LP fee into `LpFeePerShare`.
- [ ] Sets `status = Resolved`.
- [ ] Emits `events::market_finalized`.
- [ ] Unit test: called before window expires is rejected; called twice fails.

**File:** `src/prediction_market.rs` → `fn finalize_resolution`

---

## Issue #28 — `emergency_resolve`

**Title:** `[Contract] Implement emergency_resolve — admin bypasses oracle and dispute flow`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `admin`, `security`

**Description:**
Last-resort admin override when the oracle is compromised or unresponsive.

**Acceptance Criteria:**
- [ ] Requires admin auth.
- [ ] Market must not be Resolved or Cancelled.
- [ ] Applies full fee computation same as `finalize_resolution`.
- [ ] Sets `winning_outcome_id` and `status = Resolved`.
- [ ] Emits `events::market_emergency_resolved`.
- [ ] Unit test: non-admin call rejected.

**File:** `src/prediction_market.rs` → `fn emergency_resolve`

---

## Issue #29 — `redeem_position`

**Title:** `[Contract] Implement redeem_position — winner claims collateral (1 share = 1 USDC)`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `settlement`, `security`

**Description:**
After resolution, holders of winning outcome shares redeem them 1:1 for collateral.

**Acceptance Criteria:**
- [ ] Checks global pause; requires holder auth.
- [ ] Market must be `Resolved`.
- [ ] Position's `outcome_id` must match `winning_outcome_id`.
- [ ] Position must not already be redeemed.
- [ ] Transfers `position.shares` collateral to holder.
- [ ] Marks `position.redeemed = true`.
- [ ] Emits `events::position_redeemed`.
- [ ] Unit tests: losing outcome rejected; double-redeem rejected; payout matches shares.

**File:** `src/prediction_market.rs` → `fn redeem_position`

---

## Issue #30 — `refund_position`

**Title:** `[Contract] Implement refund_position — full collateral refund on cancelled market`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `settlement`

**Description:**
On cancellation, users get back all collateral they spent buying shares.

**Acceptance Criteria:**
- [ ] Checks global pause; requires holder auth.
- [ ] Market must be `Cancelled`.
- [ ] Iterates all user positions; sums `collateral_spent` from un-redeemed ones.
- [ ] Validates total > 0.
- [ ] Transfers total to holder; marks all positions redeemed.
- [ ] Emits `events::position_refunded`.
- [ ] Unit test: double-refund returns 0; market not cancelled is rejected.

**File:** `src/prediction_market.rs` → `fn refund_position`

---

## Issue #31 — `batch_redeem`

**Title:** `[Contract] Implement batch_redeem — redeem winning positions across multiple markets`

**Tags:** `smart-contract`, `prediction-market`, `feature`, `settlement`

**Description:**
Gas-efficient batch redemption. Users redeem up to 10 markets' winning positions in one transaction.

**Acceptance Criteria:**
- [ ] Checks global pause; requires holder auth.
- [ ] Accepts parallel `market_ids` and `outcome_ids` vectors (must be same length, max 10).
- [ ] Processes each market; skips (does not abort) those that are not redeemable.
- [ ] Returns `Vec<i128>` with per-market amounts (0 for skipped).
- [ ] Emits one `events::batch_redeemed` per successful market.

**File:** `src/prediction_market.rs` → `fn batch_redeem`

---

## Issue #32 — `get_market`

**Title:** `[Contract] Implement get_market — query full market struct`

**Tags:** `smart-contract`, `prediction-market`, `query`, `good first issue`

**Acceptance Criteria:**
- [ ] Returns `MarketNotFound` if absent.
- [ ] Returns full `Market` struct including metadata, outcomes, fee pools, status.
- [ ] No state mutation.

**File:** `src/prediction_market.rs` → `fn get_market`

---

## Issue #33 — `get_position` / `get_user_market_positions`

**Title:** `[Contract] Implement get_position and get_user_market_positions — query share positions`

**Tags:** `smart-contract`, `prediction-market`, `query`, `good first issue`

**Acceptance Criteria:**
- [ ] `get_position`: loads `DataKey::UserPosition`; returns `PositionNotFound` if absent.
- [ ] `get_user_market_positions`: loads `DataKey::UserMarketPositions`; returns empty Vec if none.
- [ ] No state mutation.

**File:** `src/prediction_market.rs` → `fn get_position`, `fn get_user_market_positions`

---

## Issue #34 — `get_lp_position`

**Title:** `[Contract] Implement get_lp_position — query LP provider position`

**Tags:** `smart-contract`, `prediction-market`, `query`, `good first issue`

**Acceptance Criteria:**
- [ ] Returns `LpPositionNotFound` if absent.
- [ ] Returns full `LpPosition` struct.
- [ ] No state mutation.

**File:** `src/prediction_market.rs` → `fn get_lp_position`

---

## Issue #35 — `get_amm_pool`

**Title:** `[Contract] Implement get_amm_pool — query raw AMM pool state`

**Tags:** `smart-contract`, `prediction-market`, `query`, `amm`

**Acceptance Criteria:**
- [ ] Returns `PoolNotInitialized` if absent.
- [ ] Returns `AmmPool` with all reserves and current invariant k.

**File:** `src/prediction_market.rs` → `fn get_amm_pool`

---

## Issue #36 — `get_outcome_price`

**Title:** `[Contract] Implement get_outcome_price — CPMM implied probability in basis points`

**Tags:** `smart-contract`, `prediction-market`, `query`, `amm`

**Description:**
Returns the current market-implied probability for a given outcome (0–10 000 bps).

**Acceptance Criteria:**
- [ ] Calls `amm::calc_price_bps`.
- [ ] Returns value in [0, 10_000].
- [ ] Sum of all outcome prices ≈ 10_000 (±rounding).
- [ ] No state mutation.

**File:** `src/prediction_market.rs` → `fn get_outcome_price`

---

## Issue #37 — `get_buy_quote` / `get_sell_quote`

**Title:** `[Contract] Implement get_buy_quote and get_sell_quote — read-only trade preview`

**Tags:** `smart-contract`, `prediction-market`, `query`, `amm`

**Description:**
Frontends call these before submitting a transaction to show the user exact shares/collateral and price impact.

**Acceptance Criteria:**
- [ ] `get_buy_quote`: simulates `buy_shares` without state mutation; returns `TradeReceipt`.
- [ ] `get_sell_quote`: simulates `sell_shares` without state mutation; returns `TradeReceipt`.
- [ ] Both include fees, `avg_price_bps`, and `new_price_bps` after the simulated trade.
- [ ] No state mutation.

**File:** `src/prediction_market.rs` → `fn get_buy_quote`, `fn get_sell_quote`

---

## Issue #38 — `get_market_stats`

**Title:** `[Contract] Implement get_market_stats — volume, participants, open interest`

**Tags:** `smart-contract`, `prediction-market`, `query`

**Acceptance Criteria:**
- [ ] Returns `MarketStats` with `total_volume`, `volume_24h`, `unique_traders`, `open_interest`, `last_trade_at`.
- [ ] Returns `MarketNotFound` if absent.

**File:** `src/prediction_market.rs` → `fn get_market_stats`

---

## Issue #39 — `get_oracle_report` / `get_dispute`

**Title:** `[Contract] Implement get_oracle_report and get_dispute — query resolution state`

**Tags:** `smart-contract`, `prediction-market`, `query`, `oracle`, `good first issue`

**Acceptance Criteria:**
- [ ] `get_oracle_report`: returns `Option<OracleReport>` (None if not yet reported).
- [ ] `get_dispute`: returns `Option<Dispute>` (None if no dispute).
- [ ] No state mutation.

**File:** `src/prediction_market.rs` → `fn get_oracle_report`, `fn get_dispute`

---

## Issue #40 — `get_config`

**Title:** `[Contract] Implement get_config — query global contract config`

**Tags:** `smart-contract`, `prediction-market`, `query`, `good first issue`

**Acceptance Criteria:**
- [ ] Returns `NotInitialized` if `DataKey::Config` absent.
- [ ] Returns full `Config` struct.

**File:** `src/prediction_market.rs` → `fn get_config`

---

## Issue #41 — AMM module: `calc_initial_reserves` / `calc_initial_lp_shares` / `compute_invariant`

**Title:** `[AMM] Implement pool initialisation math — reserves, LP shares, invariant k`

**Tags:** `smart-contract`, `prediction-market`, `amm`, `math`, `feature`

**Description:**
Core CPMM setup functions. Must pass precision and correctness tests.

**Acceptance Criteria:**
- [ ] `calc_initial_reserves`: splits collateral equally; verifies `n >= 2`.
- [ ] `calc_initial_lp_shares`: returns `math::sqrt(product_of_reserves)`.
- [ ] `compute_invariant`: returns product of all reserves using `math::checked_product`.
- [ ] Unit test: 100 USDC into binary market → 50/50 reserves → price = 50 % each.

**File:** `src/amm.rs`

---

## Issue #42 — AMM module: `calc_buy_shares` / `update_reserves_buy`

**Title:** `[AMM] Implement CPMM buy logic — shares out and reserve update`

**Tags:** `smart-contract`, `prediction-market`, `amm`, `feature`, `security`

**Description:**
`calc_buy_shares` solves the CPMM equation to find how many shares the buyer receives. `update_reserves_buy` applies the trade to the pool state.

**Acceptance Criteria:**
- [ ] Maintains invariant k within 1 unit of rounding after every buy.
- [ ] Returns `InsufficientReserve` if trade would drain the target reserve to 0.
- [ ] Property test: buying YES then immediately selling the same shares at same price should leave pool near-unchanged.

**File:** `src/amm.rs` → `fn calc_buy_shares`, `fn update_reserves_buy`

---

## Issue #43 — AMM module: `calc_sell_collateral` / `update_reserves_sell`

**Title:** `[AMM] Implement CPMM sell logic — collateral out and reserve update`

**Tags:** `smart-contract`, `prediction-market`, `amm`, `feature`, `security`

**Description:**
Inverse of buy. Seller returns shares; pool returns collateral.

**Acceptance Criteria:**
- [ ] Maintains invariant k within rounding tolerance after every sell.
- [ ] `collateral_out < pool.total_collateral`.
- [ ] Property test: buy 100 shares → sell 100 shares → collateral recovered is <= initial (AMM spread).

**File:** `src/amm.rs` → `fn calc_sell_collateral`, `fn update_reserves_sell`

---

## Issue #44 — AMM module: `calc_price_bps` / `calc_price_impact_bps`

**Title:** `[AMM] Implement CPMM price and price-impact calculation`

**Tags:** `smart-contract`, `prediction-market`, `amm`, `query`

**Acceptance Criteria:**
- [ ] `calc_price_bps`: sum of all outcome prices == 10 000 bps ±n rounding.
- [ ] `calc_price_impact_bps`: simulates trade without mutation; returns bps impact.
- [ ] Unit test: 50/50 binary pool → each outcome = 5 000 bps.

**File:** `src/amm.rs` → `fn calc_price_bps`, `fn calc_price_impact_bps`

---

## Issue #45 — AMM module: `calc_lp_shares_to_mint` / `calc_collateral_from_lp`

**Title:** `[AMM] Implement LP share minting and redemption math`

**Tags:** `smart-contract`, `prediction-market`, `amm`, `liquidity`

**Acceptance Criteria:**
- [ ] `calc_lp_shares_to_mint`: uses `math::mul_div` to avoid overflow; handles zero total_collateral edge case.
- [ ] `calc_collateral_from_lp`: proportional to LP share ownership.
- [ ] Unit test: mint then immediately burn with unchanged pool returns original collateral.

**File:** `src/amm.rs` → `fn calc_lp_shares_to_mint`, `fn calc_collateral_from_lp`

---

## Issue #46 — Math module: `mul_div` / `mul_div_ceil` / `checked_product`

**Title:** `[Math] Implement overflow-safe mul_div, mul_div_ceil, and checked_product`

**Tags:** `smart-contract`, `prediction-market`, `math`, `security`

**Description:**
Foundation of all CPMM and fee arithmetic. Must not panic or overflow for any valid i128 input.

**Acceptance Criteria:**
- [ ] `mul_div(a, b, d)`: correct for all i128 values where the true result fits in i128; returns 0 (or error) on intermediate overflow.
- [ ] `mul_div_ceil`: off-by-one test between floor and ceiling variants.
- [ ] `checked_product`: returns 0 on overflow; correct for small slices.
- [ ] Fuzz test: 10 000 random (a, b, d) triples with d != 0.

**File:** `src/math.rs`

---

## Issue #47 — Math module: `sqrt`

**Title:** `[Math] Implement integer floor sqrt via Newton-Raphson`

**Tags:** `smart-contract`, `prediction-market`, `math`, `good first issue`

**Acceptance Criteria:**
- [ ] Returns 0 for input 0; 1 for input 1.
- [ ] `sqrt(n)^2 <= n < (sqrt(n)+1)^2` for all tested values.
- [ ] Terminates in O(log n) iterations.
- [ ] Unit tests: known perfect squares and near-squares.

**File:** `src/math.rs` → `fn sqrt`

---

## Issue #48 — Math module: `apply_fee_bps` / `split_fees`

**Title:** `[Math] Implement fee computation helpers — apply_fee_bps and split_fees`

**Tags:** `smart-contract`, `prediction-market`, `math`, `good first issue`

**Acceptance Criteria:**
- [ ] `apply_fee_bps(1_000_000, 200)` → 20_000 (2 % of 1 USDC).
- [ ] `split_fees`: total_fees == protocol + lp + creator; net > 0.
- [ ] No overflow for max i128 amount.

**File:** `src/math.rs` → `fn apply_fee_bps`, `fn split_fees`

---

## Issue #49 — Math module: LP dividend accounting

**Title:** `[Math] Implement LP fee dividend-per-share helpers`

**Tags:** `smart-contract`, `prediction-market`, `math`, `liquidity`

**Acceptance Criteria:**
- [ ] `calc_fee_per_share_delta`: returns 0 when `total_lp_shares == 0`.
- [ ] `calc_claimable_lp_fees`: returns 0 when no new fees since last claim.
- [ ] Accumulation test: 3 trades generating fees → two LPs claim proportional amounts.

**File:** `src/math.rs` → `fn calc_fee_per_share_delta`, `fn calc_claimable_lp_fees`

---

## Issue #50 — Events module: implement all event emitters

**Title:** `[Events] Implement all contract event emitters in events.rs`

**Tags:** `smart-contract`, `prediction-market`, `events`, `feature`

**Description:**
All `todo!()` stubs in `events.rs` must be replaced with `env.events().publish(topics, data)` calls.

**Acceptance Criteria:**
- [ ] Topics use short symbols (≤ 9 chars) and include `market_id` where applicable.
- [ ] Data payloads use `contracttype`-compatible tuples or structs.
- [ ] Every function in `prediction_market.rs` that mutates state calls the corresponding emitter.
- [ ] Integration test: verify event topics and data are emitted correctly using Soroban test harness.

**File:** `src/events.rs`

---

## Issue #51 — Integration test suite

**Title:** `[Testing] Write full lifecycle integration tests for the prediction market`

**Tags:** `smart-contract`, `prediction-market`, `testing`

**Description:**
End-to-end tests for all major flows using the Soroban test harness (`soroban-sdk testutils`).

**Acceptance Criteria:**
- [ ] **Happy path**: init → create → seed → buy YES → buy NO → close → oracle report → dispute window passes → finalize → redeem YES.
- [ ] **Dispute flow**: report → dispute → admin upholds → emergency resolve → redeem.
- [ ] **Dispute rejected**: bond is slashed to treasury.
- [ ] **Cancel flow**: cancel → refund all positions.
- [ ] **LP flow**: add liquidity → trade → claim LP fees → remove liquidity.
- [ ] **Batch redeem**: redeem across 3 markets in one call.
- [ ] **Split/merge**: split → sell half → merge remaining.
- [ ] **Slippage**: buy with `min_shares_out` too high → `SlippageExceeded`.
- [ ] **Emergency pause**: pause → all mutations fail → unpause → succeed.
- [ ] All tests pass with `cargo test --features testutils`.

**File:** `stellar-contract/tests/integration_test.rs`
