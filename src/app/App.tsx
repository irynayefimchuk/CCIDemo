import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OpportunityTileSupply from '@/imports/OpportunityTileSupply2026';
import { VariantTwo } from '@/imports/Frame4535610';
import Top3Panes, { type TabKey } from '@/imports/Top3Panes';
import { MOCK_OPPORTUNITIES, type OpportunityCardData } from '@/app/data/opportunity-card-schema';

/* ── 6 mock opportunity cards — first 3 use full schema data, rest cycle through ── */
const CARDS: { id: string; data: OpportunityCardData }[] = MOCK_OPPORTUNITIES.flatMap((opp, baseIdx) => {
  // Generate 2 cards per mock record to fill 6 cards
  const cards = [{ id: `c${baseIdx * 2 + 1}`, data: opp }];
  if (baseIdx * 2 + 2 <= 6) {
    cards.push({
      id: `c${baseIdx * 2 + 2}`,
      data: { ...opp, id: `${opp.id}-b`, opportunityId: `${opp.opportunityId}-B` },
    });
  }
  return cards;
}).slice(0, 6);

/* ── Page-scroll lock (ref-counted so multiple expanded cards are safe) ── */
let _scrollLockCount = 0;
function lockPageScroll() {
  _scrollLockCount++;
  if (_scrollLockCount === 1) {
    document.documentElement.classList.add('scroll-locked');
  }
}
function unlockPageScroll() {
  _scrollLockCount = Math.max(0, _scrollLockCount - 1);
  if (_scrollLockCount === 0) {
    document.documentElement.classList.remove('scroll-locked');
  }
}

/**
 * Single combined hook: scroll the card fully into view FIRST,
 * then freeze the page.  On collapse, release the lock.
 */
function useExpandedCardLock(
  active: boolean,
  ref: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!active) return;
    if (ref.current) {
      // 1. Instantly scroll the card's top edge to the viewport top
      ref.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    // 2. Now freeze the page so the card list can't move
    lockPageScroll();

    // 3. When an overlay modal closes (e.g. Explore Data), Radix Dialog's
    //    teardown can shift the scroll offset while our lock is active.
    //    Re-scroll the card to the top after Radix finishes cleanup.
    const resync = () => {
      // Double-rAF so we run *after* Radix has fully removed its styles
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (_scrollLockCount > 0 && ref.current) {
            // Temporarily release the lock so scrollIntoView can work
            document.documentElement.classList.remove('scroll-locked');
            ref.current.scrollIntoView({ behavior: 'instant', block: 'start' });
            document.documentElement.classList.add('scroll-locked');
          }
        });
      });
    };

    window.addEventListener('overlay-closed', resync);
    return () => {
      window.removeEventListener('overlay-closed', resync);
      unlockPageScroll();
    };
  }, [active, ref]);
}

function VariantCard({
  variantKey,
  cardData,
  procedureTitle,
  onDismiss,
  onMoveToActive,
}: {
  variantKey: string;
  cardData: OpportunityCardData;
  procedureTitle?: string;
  onDismiss: () => void;
  onMoveToActive: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  /* scroll-then-lock in one effect — no ordering race */
  useExpandedCardLock(isExpanded, cardRef);

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`bg-card rounded-[var(--radius-card)] border border-border w-full max-w-[1280px] mx-auto 2xl:max-w-[1440px] transition-shadow duration-200 ${isExpanded ? 'sticky top-0 z-40 shadow-[var(--elevation-sm)]' : ''}`}
    >
      {/* Summary Card (Always Visible) */}
      <OpportunityTileSupply
        data={cardData}
        isExpanded={isExpanded}
        onToggle={handleToggle}
        onDismiss={onDismiss}
        onMoveToActive={onMoveToActive}
      />

      {/* Expanded Content — simple conditional render */}
      {isExpanded && (
        <div className="border-t border-border bg-card">
          <VariantTwo procedureTitle={procedureTitle ? procedureTitle.toUpperCase() : undefined} />
        </div>
      )}
    </div>
  );
}

/* Empty state shown when no cards are in the current tab */
function EmptyTabState({ tab }: { tab: TabKey }) {
  const messages: Record<TabKey, { title: string; description: string }> = {
    new: {
      title: 'No new opportunities',
      description: 'All opportunities have been reviewed.',
    },
    active: {
      title: 'No active opportunities',
      description: 'Move opportunities here when you\'re ready to act on them.',
    },
    dismissed: {
      title: 'No dismissed opportunities',
      description: 'Dismissed opportunities will appear here.',
    },
  };

  return (
    <div className="bg-card rounded-[var(--radius-card)] border border-border w-full max-w-[1280px] mx-auto 2xl:max-w-[1440px] py-[48px] flex flex-col items-center justify-center gap-[8px]">
      <span className="font-[family-name:var(--font-archivo)] text-[16px] font-[var(--font-weight-bold)] text-foreground">
        {messages[tab].title}
      </span>
      <span className="font-[family-name:var(--font-open-sans)] text-[length:var(--text-sm)] text-muted-foreground">
        {messages[tab].description}
      </span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('new');
  const [cardStatuses, setCardStatuses] = useState<Record<string, TabKey>>(
    () => Object.fromEntries(CARDS.map(c => [c.id, 'new' as TabKey]))
  );

  /* Counts derived from statuses */
  const counts = {
    new: Object.values(cardStatuses).filter(s => s === 'new').length,
    active: Object.values(cardStatuses).filter(s => s === 'active').length,
    dismissed: Object.values(cardStatuses).filter(s => s === 'dismissed').length,
  };

  const handleDismiss = useCallback((id: string) => {
    setCardStatuses(prev => ({ ...prev, [id]: 'dismissed' }));
  }, []);

  const handleMoveToActive = useCallback((id: string) => {
    setCardStatuses(prev => ({ ...prev, [id]: 'active' }));
  }, []);

  /* Cards visible in the current tab */
  const visibleCards = CARDS.filter(c => cardStatuses[c.id] === activeTab);

  const renderCards = () => {
    if (visibleCards.length === 0) return <EmptyTabState tab={activeTab} />;

    return (
      <div className="flex flex-col gap-[12px]">
        {visibleCards.map(card => {
          const cardProps = {
            onDismiss: () => handleDismiss(card.id),
            onMoveToActive: () => handleMoveToActive(card.id),
          };

          return (
            <VariantCard key={card.id} variantKey={card.id} cardData={card.data} procedureTitle={card.data.procedureTitle} {...cardProps} />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1440px] mx-auto space-y-4 pb-20">

        {/* Top3Panes: filters, header, tabs */}
        <Top3Panes
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* Card list or empty state */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {renderCards()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}