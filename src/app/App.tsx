import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OpportunityTileSupply from '@/imports/OpportunityTileSupply2026';
import { getCardData } from '@/imports/OpportunityTileSupply2026';
import { VariantTwo } from '@/imports/Frame4535610';
import Top3Panes, { type TabKey, type SortKey } from '@/imports/Top3Panes';
import NavbarMain from '@/imports/NavbarMain';
import FilterPanel, { DEFAULT_FILTERS, type FilterState } from './components/FilterPanel';
import HorizontalTabs, { type PageKey } from './components/navigation/HorizontalTabs';
import CciSnapshotPage from './components/CciSnapshotPage';
import ModalDismissOpportunity from '@/imports/ModalDismissOpportunity';
import ModalConfirmOpportunity from '@/imports/ModalConfirmOpportunity';
import DismissToast from './components/DismissToast';
import ActiveToast from './components/ActiveToast';
import QADrawerBot from './components/QADrawerBot';
import OpportunityDrawerBot, { type OpportunityContext } from './components/OpportunityDrawerBot';
import type { CardActionInfo } from './components/CardStatusBadge';
import { ArrowLeft, X as XIcon } from 'lucide-react';
import { getProviderId } from './components/ProviderRegistry';
import { GuidedTourProvider, useGuidedTour } from './components/guided-tour/GuidedTourContext';
import GuidedTourUI from './components/guided-tour/GuidedTourOverlay';
import TourAwareQADrawer from './components/guided-tour/TourAwareQADrawer';
import MonitorProgressPage from './components/MonitorProgressPage';

const MOCK_USERS = ['Sarah M.', 'James T.', 'Priya K.', 'Carlos R.', 'Linda W.', 'David H.', 'Anika S.', 'Michael B.'];
function getRandomUser() {
  return MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
}

const LONG_TITLE = 'TOTAL KNEE ARTHROPLASTY, VENIPUNCTURE ROUTINE LAB DRAW, GAIT TRAINING THERAPY, IMPLANTABLE KNEE DEVICE, PT EVALUATION LOW COMPLEXITY';

/* ── Card metadata for filtering ── */
interface CardMeta {
  id: string;
  title?: string;
  category: string;
  serviceLine: string;
  departments: string[];
  locations: string[];
  patientTypes: string[];
  providers: string[];
}

const CARDS: CardMeta[] = [
  { id: 'c2', title: 'HERNIA REPAIR INGUINAL LAPAROSCOPIC ROBOTIC ASSIST', category: 'Supplies', serviceLine: 'General Surgery', departments: ['OR Main'], locations: ['North Campus'], patientTypes: ['Outpatient'], providers: ['Michael Torres', 'Linda Park'] },
  { id: 'c3', title: 'TOTAL KNEE ARTHROPLASTY', category: 'Supplies', serviceLine: 'Orthopedics', departments: ['OR Main'], locations: ['North Campus'], patientTypes: ['Inpatient', 'Outpatient'], providers: ['Susan Wilson', 'Robert Chen'] },
  { id: 'c4', title: 'CATARACT EXTRACTION PHACO IOL', category: 'Supplies', serviceLine: 'Ophthalmology', departments: ['OR Ambulatory'], locations: ['North Campus'], patientTypes: ['Outpatient'], providers: ['David Patel', 'Angela Reeves'] },
  { id: 'c5', title: 'ARTHROSCOPY SHOULDER', category: 'Supplies', serviceLine: 'Orthopedics', departments: ['OR Main'], locations: ['North Campus'], patientTypes: ['Outpatient'], providers: ['James Hartley', 'Karen Nguyen'] },
  { id: 'c6', title: 'ORIF ANKLE', category: 'Supplies', serviceLine: 'Orthopedics', departments: ['OR Main'], locations: ['South Campus'], patientTypes: ['Outpatient'], providers: ['James Crawford', 'Angela Martinez'] },
  { id: 'c7', title: 'ANTERIOR CERVICAL DISCECTOMY FUSION, CERVICAL PLATE IMPLANT, BONE GRAFT MATERIAL', category: 'Supplies', serviceLine: 'Orthopedics', departments: ['OR Main'], locations: ['North Campus', 'South Campus'], patientTypes: ['Inpatient'], providers: ['Provider D', 'Provider C'] },
];

/* ── Mock savings data per card (for sorting) ── */
/* Derived from the actual savingsRange displayed on each card tile,
   so sort order always matches what the user sees. */
function parseSavingsRange(range: string): { lower: number; upper: number } {
  // Handles formats like "$21K - $222K", "$221 - $2,532", "$83K - $117K"
  const nums = range.replace(/\$/g, '').split('-').map(s => {
    const trimmed = s.trim().replace(/,/g, '');
    const kMatch = trimmed.match(/^([\d.]+)[Kk]$/);
    if (kMatch) return parseFloat(kMatch[1]) * 1000;
    return parseFloat(trimmed) || 0;
  });
  return { lower: nums[0] ?? 0, upper: nums[1] ?? nums[0] ?? 0 };
}

function getCardSavings(cardId: string): { lower: number; upper: number } {
  const card = CARDS.find(c => c.id === cardId);
  const data = getCardData(card?.title, cardId);
  return parseSavingsRange(data.savingsRange);
}

function getSortValue(cardId: string, sortKey: SortKey): number {
  const s = getCardSavings(cardId);
  if (sortKey === 'upper') return s.upper;
  if (sortKey === 'lower') return s.lower;
  return (s.lower + s.upper) / 2; // median
}

/* ── Map cards → Opportunity objects for the Monitor table ── */
import type { Opportunity, OpportunityCategory, CostDriver, EffortLevel, PipelineStatus } from './components/SnapshotData';

const CARD_COST_DRIVERS: Record<string, CostDriver> = {
  c2: 'Utilization', c3: 'Preference Card',
  c4: 'Item Variation', c5: 'Item Variation', c6: 'Item Variation', c7: 'Vendor Mix',
};

function cardToOpportunity(card: CardMeta, status: PipelineStatus): Opportunity {
  const s = getCardSavings(card.id);
  const title = card.title || LONG_TITLE;
  const procedureShort = title.split(',')[0].trim().split(' ').map(w => w[0]).join('').slice(0, 4);
  return {
    id: `card-${card.id}`,
    procedure: title.split(',')[0].trim(),
    procedureShort,
    category: card.category as OpportunityCategory,
    costDriver: CARD_COST_DRIVERS[card.id] || 'Item Variation',
    savingsLow: s.lower,
    savingsHigh: s.upper,
    avgSavingsPerCase: Math.round((s.lower + s.upper) / 2 / 200),
    caseVolume: 200 + Math.round(Math.abs(hashStr(card.id)) % 300),
    annualCases: 200 + Math.round(Math.abs(hashStr(card.id)) % 300),
    providers: card.providers,
    providerCount: card.providers.length,
    effort: (['Low', 'Medium', 'High'] as EffortLevel[])[Math.abs(hashStr(card.id)) % 3],
    serviceLine: card.serviceLine,
    department: card.departments[0] || 'OR Main',
    location: card.locations[0] || 'North Campus',
    status,
    variationPct: 15 + Math.abs(hashStr(card.id)) % 30,
    targetCostPerCase: status === 'active' ? 4000 + Math.abs(hashStr(card.id)) % 6000 : undefined,
    savedToDate: status === 'active' ? s.lower * 0.1 : undefined,
    pctSaved: status === 'active' ? 5 + Math.abs(hashStr(card.id)) % 20 : undefined,
  };
}

/** Simple deterministic hash for a string → number */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

/* ── Map card IDs to OpportunityContext for the Opportunity Drawer ── */
const CARD_OPP_CONTEXT: Record<string, Omit<OpportunityContext, 'cardId' | 'title' | 'status'>> = {
  c2: { category: 'Supplies', serviceLine: 'General Surgery', providers: ['Michael Torres', 'Linda Park'], savingsLow: 221, savingsHigh: 2532, avgSavingsPerCase: 24, caseVolume: 52, costDriver: 'Utilization', effort: 'Low', variationPct: 14 },
  c3: { category: 'Supplies', serviceLine: 'Orthopedics', providers: ['Susan Wilson', 'Robert Chen'], savingsLow: 83000, savingsHigh: 117000, avgSavingsPerCase: 500, caseVolume: 234, costDriver: 'Item Variation', effort: 'Low', variationPct: 22 },
  c4: { category: 'Supplies', serviceLine: 'Ophthalmology', providers: ['David Patel', 'Angela Reeves'], savingsLow: 27500, savingsHigh: 37100, avgSavingsPerCase: 95, caseVolume: 340, costDriver: 'Item Variation', effort: 'Low', variationPct: 45 },
  c5: { category: 'Supplies', serviceLine: 'Orthopedics', providers: ['James Hartley', 'Karen Nguyen'], savingsLow: 60000, savingsHigh: 130000, avgSavingsPerCase: 1465, caseVolume: 65, costDriver: 'Item Variation', effort: 'Medium', variationPct: 47 },
  c6: { category: 'Supplies', serviceLine: 'Orthopedics', providers: ['James Crawford', 'Angela Martinez'], savingsLow: 78000, savingsHigh: 96000, avgSavingsPerCase: 2175, caseVolume: 40, costDriver: 'Item Variation', effort: 'Medium', variationPct: 74 },
  c7: { category: 'Supplies', serviceLine: 'Orthopedics', providers: ['Provider D', 'Provider C'], savingsLow: 15000, savingsHigh: 58000, avgSavingsPerCase: 960, caseVolume: 38, costDriver: 'Item Variation', effort: 'Medium', variationPct: 18 },
};

/* ── Filter matching logic ── */
/* "All selected" = show all (default).  Deselecting items narrows results.
   Empty array = no restriction on that dimension (show all). */
function cardMatchesFilters(card: CardMeta, filters: FilterState): boolean {
  if (filters.category.length > 0 && !filters.category.includes(card.category)) return false;
  if (filters.serviceLine && card.serviceLine !== filters.serviceLine) return false;
  if (filters.departments.length > 0 && !card.departments.some(d => filters.departments.includes(d))) return false;
  if (filters.locations.length > 0 && !card.locations.some(l => filters.locations.includes(l))) return false;
  if (filters.patientTypes.length > 0 && !card.patientTypes.some(pt => filters.patientTypes.includes(pt))) return false;
  if (filters.providers.length > 0 && !card.providers.some(p => filters.providers.includes(p))) return false;
  return true;
}

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
  stickyTopOffset = 0,
) {
  useEffect(() => {
    if (!active) return;
    if (ref.current) {
      // 1. Scroll the card so its top edge sits just below the sticky header
      const el = ref.current;
      const y = el.getBoundingClientRect().top + window.scrollY - stickyTopOffset;
      window.scrollTo({ top: y, behavior: 'instant' });
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
            // Temporarily release the lock so scroll can work
            document.documentElement.classList.remove('scroll-locked');
            const el = ref.current;
            const y = el.getBoundingClientRect().top + window.scrollY - stickyTopOffset;
            window.scrollTo({ top: y, behavior: 'instant' });
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
  }, [active, ref, stickyTopOffset]);
}

function VariantCard({
  variantKey,
  procedureTitle,
  status,
  onDismiss,
  onMoveToActive,
  onHelp,
  statusInfo,
  isExpanded,
  onToggle,
}: {
  variantKey: string;
  procedureTitle?: string;
  status: TabKey;
  onDismiss: () => void;
  onMoveToActive: () => void;
  onHelp: () => void;
  statusInfo?: CardActionInfo;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  /* Left border accent based on status */
  const borderAccent =
    status === 'active'
      ? 'border-l-[4px] border-l-[var(--secondary)]'
      : status === 'dismissed'
        ? 'border-l-[4px] border-l-[var(--warning-border)]'
        : '';

  return (
    <div
      className={`bg-card rounded-[var(--radius-card)] border transition-all duration-200 ${borderAccent} w-full max-w-[1280px] mx-auto 2xl:max-w-[1440px] ${isExpanded ? 'border-primary/50 ring-1 ring-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`}
    >
      {/* Summary Card (Always Visible) */}
      <OpportunityTileSupply
        isExpanded={isExpanded}
        onToggle={onToggle}
        procedureTitle={procedureTitle}
        cardId={variantKey}
        onDismiss={status !== 'dismissed' ? onDismiss : undefined}
        onMoveToActive={status === 'dismissed' ? onMoveToActive : status === 'new' ? onMoveToActive : undefined}
        onHelp={onHelp}
        statusInfo={statusInfo}
        isActive={status === 'active'}
        activationDate={statusInfo?.actionType === 'active' ? statusInfo.actionDate : undefined}
        activatedBy={statusInfo?.actionType === 'active' ? statusInfo.actionBy : undefined}
      />

      {/* Expanded Content — simple conditional render */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              height: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
              opacity: { duration: 0.3, delay: 0.05 },
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-card rounded-b-[var(--radius-card)]">
              <VariantTwo procedureTitle={procedureTitle ? procedureTitle.toUpperCase() : undefined} cardId={variantKey} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

/* Bridge: connects tour navigation to App state */
function TourNavigationBridge({ setActivePage }: { setActivePage: (page: PageKey) => void }) {
  const { setOnNavigate } = useGuidedTour();
  useEffect(() => {
    setOnNavigate((route) => {
      if (route === 'snapshot') setActivePage('snapshot');
      else if (route === 'monitor') setActivePage('monitor');
      else setActivePage('opportunities');
    });
  }, [setOnNavigate, setActivePage]);
  return null;
}

/* Bridge: wires app actions (drawer, expand, tabs) into the tour context */
function TourAppCallbacksBridge({
  openQaDrawer,
  closeQaDrawer,
  openOppDrawer,
  closeOppDrawer,
  expandFirstCard,
  collapseCards,
  switchToActiveTab,
  switchToNewTab,
  resetAppState,
}: {
  openQaDrawer: () => void;
  closeQaDrawer: () => void;
  openOppDrawer: () => void;
  closeOppDrawer: () => void;
  expandFirstCard: () => void;
  collapseCards: () => void;
  switchToActiveTab: () => void;
  switchToNewTab: () => void;
  resetAppState: () => void;
}) {
  const { setAppCallbacks } = useGuidedTour();
  useEffect(() => {
    setAppCallbacks({ openQaDrawer, closeQaDrawer, openOppDrawer, closeOppDrawer, expandFirstCard, collapseCards, switchToActiveTab, switchToNewTab, resetAppState });
  }, [setAppCallbacks, openQaDrawer, closeQaDrawer, openOppDrawer, closeOppDrawer, expandFirstCard, collapseCards, switchToActiveTab, switchToNewTab, resetAppState]);
  return null;
}

/* Bridge: provides restart callback for navbar tour button */
function useTourRestart() {
  const { restart } = useGuidedTour();
  return restart;
}

function NavbarWithTour({ onHelpClick }: { onHelpClick: () => void }) {
  const restart = useTourRestart();
  return <NavbarMain onHelpClick={onHelpClick} onTourClick={restart} />;
}

export default function App() {
  return (
    <GuidedTourProvider>
      <AppInner />
      <GuidedTourUI />
    </GuidedTourProvider>
  );
}

function AppInner() {
  const [activeTab, setActiveTab] = useState<TabKey>('new');
  const [cardStatuses, setCardStatuses] = useState<Record<string, TabKey>>(
    () => {
      const statuses = Object.fromEntries(CARDS.map(c => [c.id, 'new' as TabKey]));
      statuses['c7'] = 'active'; // Pre-existing active card (4 months)
      return statuses;
    }
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() => ({ ...DEFAULT_FILTERS }));
  const [activePage, setActivePage] = useState<PageKey>('snapshot');

  /* Force-sync filters with DEFAULT_FILTERS on hot-reload / mount */
  useEffect(() => {
    setFilters(prev => {
      // If the stored filters still reference old provider names, reset
      const hasStaleProviders = prev.providers.length > 0 &&
        prev.providers.some(p => p.startsWith('Dr.') || p.startsWith('PRV-'));
      if (hasStaleProviders) return { ...DEFAULT_FILTERS };
      return prev;
    });
  }, []);

  /* ── Sort state ── */
  const [sortBy, setSortBy] = useState<SortKey>('upper');

  /* ── Dismiss modal + toast state ── */
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [pendingDismissId, setPendingDismissId] = useState<string | null>(null);
  const [lastDismissedId, setLastDismissedId] = useState<string | null>(null);
  const [lastDismissedPrevStatus, setLastDismissedPrevStatus] = useState<TabKey | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  /* ── Confirm modal + toast state ── */
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingConfirmId, setPendingConfirmId] = useState<string | null>(null);
  const [lastConfirmedId, setLastConfirmedId] = useState<string | null>(null);
  const [lastConfirmedPrevStatus, setLastConfirmedPrevStatus] = useState<TabKey | null>(null);
  const [activeToastVisible, setActiveToastVisible] = useState(false);

  /* ── Exit animation direction tracking ── */
  // Tracks per-card exit direction so AnimatePresence exit variants know which way to slide
  const exitDirectionRef = useRef<Record<string, 'left' | 'right'>>({});

  /* ── Q&A Drawer state ── */
  const [qaDrawerOpen, setQaDrawerOpen] = useState(false);

  /* ── Opportunity Drawer state ── */
  const [oppDrawerOpen, setOppDrawerOpen] = useState(false);
  const [oppDrawerContext, setOppDrawerContext] = useState<OpportunityContext | null>(null);

  const handleOpenOppDrawer = useCallback((cardId: string) => {
    const card = CARDS.find(c => c.id === cardId);
    const ctx = CARD_OPP_CONTEXT[cardId];
    if (!card || !ctx) return;
    setOppDrawerContext({
      cardId,
      title: card.title || LONG_TITLE,
      status: cardStatuses[cardId] || 'new',
      ...ctx,
    });
    setOppDrawerOpen(true);
  }, [cardStatuses]);

  /* ── Snapshot drilldown state ── */
  const [snapshotDrilldown, setSnapshotDrilldown] = useState<{ term: string; type: 'procedures' | 'providers' | 'opportunities' } | null>(null);

  /* ── Accordion: only one card expanded at a time ── */
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const handleCardToggle = useCallback((cardId: string) => {
    setExpandedCardId(prev => (prev === cardId ? null : cardId));
  }, []);

  /* ── Tour callback helpers ── */
  const tourOpenQa = useCallback(() => setQaDrawerOpen(true), []);
  const tourCloseQa = useCallback(() => setQaDrawerOpen(false), []);
  const tourCloseOpp = useCallback(() => setOppDrawerOpen(false), []);
  /* Tour: open opp drawer for the first visible card */
  const tourOpenOpp = useCallback(() => {
    const firstCard = CARDS.filter(c => cardStatuses[c.id] === activeTab && cardMatchesFilters(c, filters))[0];
    if (firstCard) handleOpenOppDrawer(firstCard.id);
  }, [activeTab, cardStatuses, filters, handleOpenOppDrawer]);
  const tourCollapseCards = useCallback(() => setExpandedCardId(null), []);
  const tourSwitchActive = useCallback(() => {
    setExpandedCardId(null); // Collapse any expanded card before switching
    setActiveTab('active');
  }, []);
  const tourSwitchNew = useCallback(() => {
    setExpandedCardId(null);
    setActiveTab('new');
  }, []);
  const tourResetAppState = useCallback(() => {
    setSnapshotDrilldown(null);
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  /* ── Cross-filter: navigate from Snapshot to Opportunities Hub ── */
  const handleNavigateToOpportunities = useCallback((snapshotFilters?: { category?: string; serviceLine?: string; drilldown?: { term: string; type: 'procedures' | 'providers' | 'opportunities' } }) => {
    if (snapshotFilters) {
      setFilters(prev => ({
        ...prev,
        category: snapshotFilters.category ? [snapshotFilters.category] : prev.category,
        serviceLine: snapshotFilters.serviceLine || prev.serviceLine,
      }));
      setSnapshotDrilldown(snapshotFilters.drilldown ?? null);
    } else {
      setSnapshotDrilldown(null);
    }
    setActivePage('opportunities');
  }, []);

  /* ── Sticky header height measurement ── */
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setHeaderHeight(entry.contentRect.height);
    });
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  /* ── Per-card action info (who, when, reason) ── */
  const [cardActionInfos, setCardActionInfos] = useState<Record<string, CardActionInfo>>(() => {
    // Pre-seed c7 with activation info from ~4 months ago
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    const dateStr = `${fourMonthsAgo.getMonth() + 1}/${fourMonthsAgo.getDate()}/${String(fourMonthsAgo.getFullYear()).slice(-2)}`;
    return {
      c7: {
        actionType: 'active',
        actionBy: 'Priya K.',
        actionDate: dateStr,
      },
    };
  });

  /* ── Compute newly-activated card opportunities for Monitor table ── */
  const activeCardOpps = useMemo(() => {
    return CARDS
      .filter(c => cardStatuses[c.id] === 'active')
      .map(c => cardToOpportunity(c, 'active'));
  }, [cardStatuses]);

  /* Cards visible in the current tab, filtered by active filters + optional drilldown */
  const drilldownMatchesCard = (card: CardMeta): boolean => {
    if (!snapshotDrilldown) return true;
    const term = snapshotDrilldown.term.toLowerCase();
    const title = (card.title || LONG_TITLE).toLowerCase();
    if (snapshotDrilldown.type === 'providers') {
      return card.providers.some(p => p.toLowerCase().includes(term));
    }
    // procedures / opportunities — match against card title
    return title.includes(term);
  };

  const visibleCards = CARDS
    .filter(c => cardStatuses[c.id] === activeTab && cardMatchesFilters(c, filters) && drilldownMatchesCard(c))
    .sort((a, b) => getSortValue(b.id, sortBy) - getSortValue(a.id, sortBy));

  /* Tour expand — must be after visibleCards is computed */
  const tourExpandFirst = useCallback(() => { if (visibleCards[0]) setExpandedCardId(visibleCards[0].id); }, [visibleCards]);

  /* Counts derived from statuses — filtered */
  const counts = {
    new: CARDS.filter(c => cardStatuses[c.id] === 'new' && cardMatchesFilters(c, filters)).length,
    active: CARDS.filter(c => cardStatuses[c.id] === 'active' && cardMatchesFilters(c, filters)).length,
    dismissed: CARDS.filter(c => cardStatuses[c.id] === 'dismissed' && cardMatchesFilters(c, filters)).length,
  };

  const handleDismiss = useCallback((id: string) => {
    setPendingDismissId(id);
    setDismissModalOpen(true);
  }, []);

  const handleDismissConfirm = useCallback((reason: string) => {
    if (!pendingDismissId) return;
    setLastDismissedPrevStatus(cardStatuses[pendingDismissId]);
    setLastDismissedId(pendingDismissId);
    setDismissModalOpen(false);

    // Store action info
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${String(now.getFullYear()).slice(-2)}`;
    setCardActionInfos(prev => ({
      ...prev,
      [pendingDismissId]: {
        actionType: 'dismissed',
        actionBy: getRandomUser(),
        actionDate: dateStr,
        reason,
      },
    }));

    // Set exit direction then update status — AnimatePresence handles the rest
    exitDirectionRef.current[pendingDismissId] = 'left';
    setCardStatuses(prev => ({ ...prev, [pendingDismissId]: 'dismissed' }));
    setPendingDismissId(null);

    // Show toast immediately
    setToastVisible(true);
  }, [pendingDismissId, cardStatuses]);

  const handleUndoDismiss = useCallback(() => {
    if (lastDismissedId && lastDismissedPrevStatus) {
      setCardStatuses(prev => ({ ...prev, [lastDismissedId]: lastDismissedPrevStatus }));
      // Clear action info on undo
      setCardActionInfos(prev => {
        const next = { ...prev };
        delete next[lastDismissedId];
        return next;
      });
    }
    setToastVisible(false);
    setLastDismissedId(null);
    setLastDismissedPrevStatus(null);
  }, [lastDismissedId, lastDismissedPrevStatus]);

  const handleMoveToActive = useCallback((id: string) => {
    setPendingConfirmId(id);
    setConfirmModalOpen(true);
  }, []);

  const handleConfirmConfirm = useCallback(() => {
    if (!pendingConfirmId) return;
    setLastConfirmedPrevStatus(cardStatuses[pendingConfirmId]);
    setLastConfirmedId(pendingConfirmId);
    setConfirmModalOpen(false);

    // Store action info
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${String(now.getFullYear()).slice(-2)}`;
    setCardActionInfos(prev => ({
      ...prev,
      [pendingConfirmId]: {
        actionType: 'active',
        actionBy: getRandomUser(),
        actionDate: dateStr,
      },
    }));

    // Set exit direction then update status — AnimatePresence handles the rest
    exitDirectionRef.current[pendingConfirmId] = 'right';
    setCardStatuses(prev => ({ ...prev, [pendingConfirmId]: 'active' }));
    setPendingConfirmId(null);

    // Show toast immediately
    setActiveToastVisible(true);
  }, [pendingConfirmId, cardStatuses]);

  const handleUndoConfirm = useCallback(() => {
    if (lastConfirmedId && lastConfirmedPrevStatus) {
      setCardStatuses(prev => ({ ...prev, [lastConfirmedId]: lastConfirmedPrevStatus }));
      // Clear action info on undo
      setCardActionInfos(prev => {
        const next = { ...prev };
        delete next[lastConfirmedId];
        return next;
      });
    }
    setActiveToastVisible(false);
    setLastConfirmedId(null);
    setLastConfirmedPrevStatus(null);
  }, [lastConfirmedId, lastConfirmedPrevStatus]);

  const renderCards = () => {
    if (visibleCards.length === 0) {
      return (
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <EmptyTabState tab={activeTab} />
        </motion.div>
      );
    }

    return (
      <div className="flex flex-col gap-[12px]">
        <AnimatePresence initial={false}>
          {visibleCards.map(card => {
            const cardProps = {
              onDismiss: () => handleDismiss(card.id),
              onMoveToActive: () => handleMoveToActive(card.id),
              onHelp: () => handleOpenOppDrawer(card.id),
            };

            return (
              <motion.div
                key={card.id}
                layout="position"
                className="w-full"
                data-tour={visibleCards.indexOf(card) === 0 ? 'first-card' : undefined}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                exit={(custom) => {
                  const dir = exitDirectionRef.current[card.id];
                  return {
                    opacity: 0,
                    x: dir === 'left' ? -120 : dir === 'right' ? 120 : 0,
                    scale: 0.96,
                    transition: {
                      duration: 0.35,
                      ease: [0.32, 0.72, 0, 1],
                    },
                  };
                }}
                transition={{
                  layout: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
                  opacity: { duration: 0.3 },
                  y: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                  scale: { duration: 0.3 },
                }}
                onAnimationComplete={() => {
                  // Clean up exit direction ref after animation
                  delete exitDirectionRef.current[card.id];
                }}
              >
                <VariantCard
                  variantKey={card.id}
                  procedureTitle={card.title || LONG_TITLE}
                  status={cardStatuses[card.id]}
                  {...cardProps}
                  statusInfo={cardActionInfos[card.id]}
                  isExpanded={expandedCardId === card.id}
                  onToggle={() => handleCardToggle(card.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`bg-background flex flex-col overflow-x-hidden ${activePage === 'snapshot' || activePage === 'monitor' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Navbar */}
      <header className={`${activePage === 'snapshot' || activePage === 'monitor' ? '' : 'sticky top-0'} z-50 shrink-0 w-full`} ref={headerRef}>
        <NavbarWithTour onHelpClick={() => setQaDrawerOpen(true)} />
        <HorizontalTabs
          activePage={activePage}
          onPageChange={(page) => { setActivePage(page); if (page !== 'opportunities') setSnapshotDrilldown(null); }}
          onToggleFilters={() => setFilterOpen(prev => !prev)}
          filterState={filters}
          onFilterChange={(f) => f && setFilters(f)}
        />
        {activePage === 'opportunities' && (
          <div className="bg-background px-[var(--spacing-page)] pt-[2px] pb-[0px]">
            <div className="max-w-[1440px] mx-auto">
              <Top3Panes
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={counts}
                onToggleFilters={() => setFilterOpen(prev => !prev)}
                filterState={filters}
                onFilterChange={(f) => f && setFilters(f)}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className={`flex-1 px-[var(--spacing-page)] overflow-x-hidden ${activePage === 'snapshot' || activePage === 'monitor' ? 'min-h-0 overflow-hidden' : ''}`}>
        <AnimatePresence mode="wait">
          {activePage === 'snapshot' ? (
            <motion.div
              key="snapshot"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="h-full min-h-0"
            >
              <CciSnapshotPage onNavigateToOpportunities={handleNavigateToOpportunities} filters={filters} />
            </motion.div>
          ) : activePage === 'monitor' ? (
            <motion.div
              key="monitor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="h-full min-h-0"
            >
              <MonitorProgressPage onNavigateToOpportunities={handleNavigateToOpportunities} filters={filters} activeCardOpportunities={activeCardOpps} />
            </motion.div>
          ) : (
            <motion.div className="px-[0px] py-[4px]"
              key="opportunities"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="max-w-[1440px] mx-auto p-[0px]">
                {/* Snapshot drilldown banner */}
                {snapshotDrilldown && (
                  <div className="flex items-center gap-[10px] mb-[10px] px-[12px] py-[8px] bg-accent/8 border border-accent/20 rounded-[var(--radius-card)]">
                    <button
                      onClick={() => { setSnapshotDrilldown(null); setActivePage('snapshot'); }}
                      className="inline-flex items-center gap-[4px] cursor-pointer bg-transparent hover:opacity-80 transition-opacity shrink-0"
                    >
                      <ArrowLeft size={14} className="text-accent" />
                      <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-accent text-[12px]">
                        Back to Snapshot
                      </span>
                    </button>
                    <span className="w-px h-[16px] bg-accent/20" />
                    <span className="font-[family-name:var(--font-open-sans)] text-foreground text-[12px] truncate flex-1">
                      Showing {snapshotDrilldown.type === 'providers' ? 'provider' : 'procedure'}: <span className="font-[var(--font-weight-bold)]">{snapshotDrilldown.type === 'providers' ? getProviderId(snapshotDrilldown.term) : snapshotDrilldown.term}</span>
                    </span>
                    <button
                      onClick={() => setSnapshotDrilldown(null)}
                      title="Clear drilldown filter"
                      className="size-[24px] rounded-[var(--radius-button)] hover:bg-accent/10 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    >
                      <XIcon size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                )}
                {/* Card list or empty state */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    data-tour="card-list"
                  >
                    {renderCards()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />

      {/* Dismiss Modal */}
      <ModalDismissOpportunity
        open={dismissModalOpen}
        onOpenChange={(open) => {
          setDismissModalOpen(open);
          if (!open) setPendingDismissId(null);
        }}
        onConfirm={handleDismissConfirm}
      />

      {/* Dismiss Toast */}
      <DismissToast
        visible={toastVisible}
        onClose={() => {
          setToastVisible(false);
          setLastDismissedId(null);
          setLastDismissedPrevStatus(null);
        }}
        onUndo={handleUndoDismiss}
      />

      {/* Confirm Modal */}
      <ModalConfirmOpportunity
        open={confirmModalOpen}
        onOpenChange={(open) => {
          setConfirmModalOpen(open);
          if (!open) setPendingConfirmId(null);
        }}
        onConfirm={handleConfirmConfirm}
      />

      {/* Active Toast */}
      <ActiveToast
        visible={activeToastVisible}
        onClose={() => {
          setActiveToastVisible(false);
          setLastConfirmedId(null);
          setLastConfirmedPrevStatus(null);
        }}
        onUndo={handleUndoConfirm}
      />

      {/* QA Drawer Bot */}
      <TourAwareQADrawer open={qaDrawerOpen} onOpenChange={setQaDrawerOpen} />

      {/* Opportunity Drawer Bot */}
      <OpportunityDrawerBot open={oppDrawerOpen} onOpenChange={setOppDrawerOpen} opportunity={oppDrawerContext} />

      {/* Tour Navigation Bridge */}
      <TourNavigationBridge setActivePage={setActivePage} />

      {/* Tour App Callbacks Bridge */}
      <TourAppCallbacksBridge
        openQaDrawer={tourOpenQa}
        closeQaDrawer={tourCloseQa}
        openOppDrawer={tourOpenOpp}
        closeOppDrawer={tourCloseOpp}
        expandFirstCard={tourExpandFirst}
        collapseCards={tourCollapseCards}
        switchToActiveTab={tourSwitchActive}
        switchToNewTab={tourSwitchNew}
        resetAppState={tourResetAppState}
      />
    </div>
  );
}
