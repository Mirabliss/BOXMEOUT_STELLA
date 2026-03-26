use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum PredictionMarketError {
    // ── Initialisation ──────────────────────────────────────────────────────
    AlreadyInitialized = 1,
    NotInitialized = 2,

    // ── Authorisation & roles ────────────────────────────────────────────────
    /// Caller is not the superadmin
    Unauthorized = 10,
    /// Caller is not the oracle for this market
    NotOracle = 11,
    /// Caller is not a whitelisted operator
    NotOperator = 12,
    /// Caller is not the market creator
    NotCreator = 13,
    /// Caller is not the position owner
    NotPositionOwner = 14,

    // ── Global state ─────────────────────────────────────────────────────────
    /// Contract is in emergency pause; all mutations blocked
    EmergencyPaused = 20,

    // ── Market lifecycle ─────────────────────────────────────────────────────
    MarketNotFound = 30,
    /// Expected Open but market is in a different status
    MarketNotOpen = 31,
    /// Betting close time has already passed
    BettingClosed = 32,
    /// Resolution deadline has not yet been reached
    DeadlineNotReached = 33,
    /// Resolution deadline has already passed (e.g. can't reopen)
    DeadlinePassed = 34,
    MarketNotResolvable = 35,
    AlreadyResolved = 36,
    AlreadyCancelled = 37,
    /// Market is not in Reported status (required for dispute/finalize)
    MarketNotReported = 38,
    /// Market is still in its dispute window; cannot finalise yet
    DisputeWindowActive = 39,

    // ── Outcomes ─────────────────────────────────────────────────────────────
    InvalidOutcome = 40,
    TooFewOutcomes = 41,
    TooManyOutcomes = 42,
    DuplicateOutcomeLabel = 43,

    // ── AMM / Trading ────────────────────────────────────────────────────────
    /// Collateral amount is below Config.min_trade
    TradeTooSmall = 50,
    /// AMM pool has not been seeded with initial liquidity
    PoolNotInitialized = 51,
    /// Slippage guard: actual output is below caller's min_amount_out
    SlippageExceeded = 52,
    /// Reserve would drop to zero; trade size is too large for the pool
    InsufficientReserve = 53,
    /// Price impact exceeds the market's allowed circuit-breaker threshold
    CircuitBreakerTripped = 54,

    // ── Positions ────────────────────────────────────────────────────────────
    PositionNotFound = 60,
    /// User has fewer shares than requested for sell/merge
    InsufficientShares = 61,
    /// Position has already been redeemed
    AlreadyRedeemed = 62,
    /// Outcome is not the winning outcome; cannot redeem
    NotWinningOutcome = 63,

    // ── Liquidity ────────────────────────────────────────────────────────────
    LpPositionNotFound = 70,
    ZeroLiquidity = 71,
    InsufficientLpShares = 72,
    /// LP fees for this position have already been collected
    LpFeesAlreadyClaimed = 73,
    /// Initial liquidity must meet Config.min_liquidity
    BelowMinLiquidity = 74,

    // ── Oracle / Dispute ─────────────────────────────────────────────────────
    /// A dispute already exists for this market
    DisputeAlreadyExists = 80,
    DisputeNotFound = 81,
    /// Dispute window has already expired; cannot dispute
    DisputeWindowExpired = 82,
    /// Dispute bond payment failed or is insufficient
    InsufficientBond = 83,
    /// Dispute has already been resolved
    DisputeAlreadyResolved = 84,

    // ── Fees ─────────────────────────────────────────────────────────────────
    /// fee_bps values sum to more than 10 000 (100 %)
    FeesTooHigh = 90,
    /// Nothing to collect; fee pool is zero
    NoFeesToCollect = 91,

    // ── Metadata ─────────────────────────────────────────────────────────────
    MetadataTooLong = 95,

    // ── General ──────────────────────────────────────────────────────────────
    ArithmeticError = 100,
    TransferFailed = 101,
    InvalidTimestamp = 102,
}
