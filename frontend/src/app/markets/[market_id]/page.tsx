// ============================================================
// BOXMEOUT — Market Detail Page (/markets/[market_id])
// ============================================================

import { ErrorBoundary } from '../../../components/ui/ErrorBoundary';
import MarketDetailContent from './MarketDetailContent';

interface MarketDetailPageProps {
  params: { market_id: string };
}

export default function MarketDetailPage({ params }: MarketDetailPageProps): JSX.Element {
  return (
    <ErrorBoundary>
      <MarketDetailContent market_id={params.market_id} />
    </ErrorBoundary>
  );
}
