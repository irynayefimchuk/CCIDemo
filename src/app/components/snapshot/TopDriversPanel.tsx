import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Stethoscope, Users, Lightbulb, RefreshCw, FlaskConical, List, ArrowRight, X, Download, BarChart3, Table2, ExternalLink, Repeat2, Eye, EyeOff, ChevronDown, Check, Sparkles } from 'lucide-react';
import type { Opportunity, PipelineStatus, OpportunityCategory } from '../SnapshotData';
import { formatCurrency } from '../SnapshotData';
import type { BucketSelection } from './SavingsEffortPanel';
import { getProviderId, getProviderName, DarkTooltip } from '../ProviderRegistry';
import FilterChipGroup from '../shared/FilterChipGroup';
import TabBar, { type TabItem, InlineTabBar } from '../navigation/TabBar';
import filterSvgPaths from '../../../imports/svg-ay16myxzm9';

export type DriverRankBy = 'impact' | 'volume' | 'perCase' | 'repeat';

interface Props {
  opportunities: Opportunity[];
  selection: BucketSelection | null;
  onViewAll?: (type: 'procedures' | 'providers' | 'opportunities') => void;
  onViewRowInHub?: (rowName: string, type: 'procedures' | 'providers' | 'opportunities') => void;
}

/* Mirrors SavingsEffortPanel STATE_META exactly */
const STATUS_META: Record<PipelineStatus, { label: string; color: string }> = {
  new:       { label: 'New',       color: 'var(--status-new)' },
  active:    { label: 'Active',    color: 'var(--status-active)' },
  dismissed: { label: 'Dismissed', color: 'var(--status-dismissed)' },
};

interface DriverRow {
  name: string;
  mid: number;
  low: number;
  high: number;
  cases: number;
  avgPerCase: number;          /* weighted avg savings per case */
  oppCount: number;            /* how many opportunities were combined */
  category?: OpportunityCategory;  /* dominant or sole category */
  status?: PipelineStatus;         /* dominant or sole status */
  providersImpacted: number;   /* unique providers touching this row */
  proceduresImpacted: number;  /* unique procedures touching this row */
}

/* -- Sort helper for rankBy -- */
function sortByRank(rows: DriverRow[], rankBy: DriverRankBy, tileType?: 'procedures' | 'providers' | 'opportunities'): DriverRow[] {
  return [...rows].sort((a, b) => {
    if (rankBy === 'impact') return b.mid - a.mid;
    if (rankBy === 'volume') return b.cases - a.cases;
    if (rankBy === 'repeat') {
      if (tileType === 'providers') {
        // providers: sort by # opportunities, tie-breaker procedures impacted
        return (b.oppCount - a.oppCount) || (b.proceduresImpacted - a.proceduresImpacted);
      }
      // procedures / opportunities: sort by providers impacted, tie-breaker # opportunities
      return (b.providersImpacted - a.providersImpacted) || (b.oppCount - a.oppCount);
    }
    return b.avgPerCase - a.avgPerCase; // perCase
  });
}

/* -- Filtering -- */
function filterBucket(opps: Opportunity[], sel: BucketSelection | null): Opportunity[] {
  if (!sel) return opps;
  let result = opps.filter(o => o.category === sel.category);
  if (sel.status) result = result.filter(o => o.status === sel.status);
  return result;
}

/* -- helper: find the most frequent value in an array -- */
function dominant<T>(arr: T[]): T | undefined {
  const counts = new Map<T, number>();
  arr.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
  let best: T | undefined;
  let bestN = 0;
  counts.forEach((n, v) => { if (n > bestN) { best = v; bestN = n; } });
  return best;
}

/* -- Aggregators -- */
function topProcedures(opps: Opportunity[]): DriverRow[] {
  const map: Record<string, { low: number; high: number; cases: number; weightedSav: number; oppCount: number; categories: OpportunityCategory[]; statuses: PipelineStatus[]; providers: Set<string> }> = {};
  opps.forEach(o => {
    if (!map[o.procedure]) map[o.procedure] = { low: 0, high: 0, cases: 0, weightedSav: 0, oppCount: 0, categories: [], statuses: [], providers: new Set() };
    map[o.procedure].low += o.savingsLow;
    map[o.procedure].high += o.savingsHigh;
    map[o.procedure].cases += o.caseVolume;
    map[o.procedure].weightedSav += o.avgSavingsPerCase * o.caseVolume;
    map[o.procedure].oppCount += 1;
    map[o.procedure].categories.push(o.category);
    map[o.procedure].statuses.push(o.status);
    o.providers.forEach(p => map[o.procedure].providers.add(p));
  });
  return Object.entries(map)
    .map(([name, v]) => ({
      name,
      mid: (v.low + v.high) / 2,
      low: v.low,
      high: v.high,
      cases: v.cases,
      avgPerCase: v.cases > 0 ? v.weightedSav / v.cases : 0,
      oppCount: v.oppCount,
      category: dominant(v.categories),
      status: dominant(v.statuses),
      providersImpacted: v.providers.size,
      proceduresImpacted: 1,
    }))
    .sort((a, b) => b.mid - a.mid);
}

function topProviders(opps: Opportunity[]): DriverRow[] {
  const map: Record<string, { low: number; high: number; cases: number; weightedSav: number; oppCount: number; categories: OpportunityCategory[]; statuses: PipelineStatus[]; procedures: Set<string> }> = {};
  opps.forEach(o => {
    o.providers.forEach(p => {
      if (!map[p]) map[p] = { low: 0, high: 0, cases: 0, weightedSav: 0, oppCount: 0, categories: [], statuses: [], procedures: new Set() };
      map[p].low += o.savingsLow;
      map[p].high += o.savingsHigh;
      map[p].cases += o.caseVolume;
      map[p].weightedSav += o.avgSavingsPerCase * o.caseVolume;
      map[p].oppCount += 1;
      map[p].categories.push(o.category);
      map[p].statuses.push(o.status);
      map[p].procedures.add(o.procedure);
    });
  });
  return Object.entries(map)
    .map(([name, v]) => ({
      name,
      mid: (v.low + v.high) / 2,
      low: v.low,
      high: v.high,
      cases: v.cases,
      avgPerCase: v.cases > 0 ? v.weightedSav / v.cases : 0,
      oppCount: v.oppCount,
      category: dominant(v.categories),
      status: dominant(v.statuses),
      providersImpacted: 1,
      proceduresImpacted: v.procedures.size,
    }))
    .sort((a, b) => b.mid - a.mid);
}

function topOpportunities(opps: Opportunity[]): DriverRow[] {
  return [...opps]
    .map(o => ({
      name: o.procedure,
      mid: (o.savingsLow + o.savingsHigh) / 2,
      low: o.savingsLow,
      high: o.savingsHigh,
      cases: o.caseVolume,
      avgPerCase: o.avgSavingsPerCase,
      oppCount: 1,
      category: o.category,
      status: o.status,
      providersImpacted: o.providers.length,
      proceduresImpacted: 1,
    }))
    .sort((a, b) => b.mid - a.mid);
}

/* -- Compact currency for $/case badge -- */
function fmtPerCase(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${Math.round(v)}`;
}

/* Category icon map */
const CATEGORY_ICON: Record<OpportunityCategory, React.ReactNode> = {
  'Supplies':           <Stethoscope size={11} />,
  'Routine services':   <RefreshCw size={11} />,
  'Ancillary services': <FlaskConical size={11} />,
};

/* ================================================================= */
/*  Shared row renderer (used in both DriverTile and ViewAllModal)    */
/* ================================================================= */
function DriverRowView({
  r,
  i,
  rankBy,
  globalMax,
  isLast,
  showCategoryContext,
  onViewInHub,
  compact,
  highlightRank,
  isProviderRow,
  tileType,
  barColor,
}: {
  r: DriverRow;
  i: number;
  rankBy: DriverRankBy;
  globalMax: number;
  isLast: boolean;
  showCategoryContext: boolean;
  onViewInHub?: () => void;
  compact?: boolean;
  highlightRank?: number;
  isProviderRow?: boolean;
  tileType?: 'procedures' | 'providers' | 'opportunities';
  barColor?: string;
}) {
  const repeatMetric = (row: DriverRow) =>
    tileType === 'providers' ? row.oppCount : row.providersImpacted;
  const repeatLabel = (row: DriverRow) =>
    tileType === 'providers'
      ? `${row.oppCount} opp${row.oppCount !== 1 ? 's' : ''}`
      : `${row.providersImpacted} provider${row.providersImpacted !== 1 ? 's' : ''}`;

  const fmtValue = (row: DriverRow): string => {
    if (rankBy === 'volume') return `${row.cases.toLocaleString()} cases`;
    if (rankBy === 'perCase') return fmtPerCase(row.avgPerCase);
    if (rankBy === 'repeat') return repeatLabel(row);
    return formatCurrency(row.mid);
  };

  const getBarPcts = (row: DriverRow) => {
    if (rankBy === 'volume') {
      const pct = (row.cases / globalMax) * 100;
      return { lowPct: 0, midPct: pct, highPct: pct };
    }
    if (rankBy === 'perCase') {
      const pct = (row.avgPerCase / globalMax) * 100;
      return { lowPct: 0, midPct: pct, highPct: pct };
    }
    if (rankBy === 'repeat') {
      const pct = (repeatMetric(row) / globalMax) * 100;
      return { lowPct: 0, midPct: pct, highPct: pct };
    }
    return {
      lowPct: (row.low / globalMax) * 100,
      midPct: (row.mid / globalMax) * 100,
      highPct: Math.min((row.high / globalMax) * 100, 100),
    };
  };

  const { lowPct, midPct, highPct } = getBarPcts(r);
  const hasRange = rankBy === 'impact';
  const statusMeta = r.status ? STATUS_META[r.status] : null;
  const isTopN = highlightRank !== undefined && i < highlightRank;

  return (
    <div className={`group/row relative flex flex-col gap-[2px] ${!isLast ? 'border-b border-border' : ''} px-[0px] py-[4px]`}>
      {/* Row 1: rank # + name (full width) */}
      <div className="flex items-baseline gap-[6px]">
        <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-bold)] text-muted-foreground tabular-nums shrink-0 w-[14px] text-[14px]">
          {i + 1}
        </span>
        <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-foreground truncate flex-1 min-w-0 text-[14px]">
          {isProviderRow ? (
            <DarkTooltip content={getProviderName(r.name)}>
              <span className="cursor-default">{getProviderId(r.name)}</span>
            </DarkTooltip>
          ) : (
            r.name
          )}
        </span>
      </div>
      {/* Row 2: bar + value + view link */}
      <div className="flex items-center gap-[6px] pl-[20px]">
        <div className="relative flex-1 h-[12px]">
          <div className="absolute inset-0 rounded-full" style={{ backgroundColor: 'var(--background)' }} />
          {hasRange ? (
            <>
              <div
                className="absolute inset-y-0 rounded-[2px]"
                style={{ left: `${lowPct}%`, width: `${Math.max(highPct - lowPct, 1)}%`, backgroundColor: barColor || 'var(--chart-1)' }}
              />
              <div
                className="absolute top-[-2px] bottom-[-2px] w-[2.5px] rounded-full"
                style={{ left: `${midPct}%`, transform: 'translateX(-50%)', backgroundColor: 'var(--muted-foreground)' }}
              />
            </>
          ) : (
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{ width: `${Math.max(midPct, 2)}%`, backgroundColor: barColor || 'var(--chart-1)' }}
            />
          )}
        </div>
        <span className="font-[family-name:var(--font-archivo)] font-[var(--font-weight-bold)] text-foreground text-[var(--text-xs)] tabular-nums shrink-0 min-w-[48px] text-right text-[14px]">
          {fmtValue(r)}
        </span>
        {/* View action */}
        {onViewInHub ? (
          compact ? (
            <button
              onClick={onViewInHub}
              title="View"
              className="group/hub shrink-0 size-[20px] rounded-[var(--radius-button)] hover:bg-muted flex items-center justify-center cursor-pointer transition-colors"
            >
              <ExternalLink size={12} className="text-muted-foreground group-hover/hub:text-accent transition-colors" />
            </button>
          ) : (
            <button
              onClick={onViewInHub}
              className="shrink-0 inline-flex items-center gap-[3px] cursor-pointer bg-transparent hover:opacity-80 transition-opacity whitespace-nowrap"
              title="View in Opportunities Hub"
            >
              
              <ExternalLink size={11} className="text-accent" />
            </button>
          )
        ) : (
          <span className="shrink-0 size-[20px] flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer">
            <ExternalLink size={11} className="text-accent" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ================================================================= */
/*  ViewAllModal                                                       */
/* ================================================================= */
const ALL_CATEGORIES: OpportunityCategory[] = ['Supplies', 'Routine services', 'Ancillary services'];
const ALL_STATUSES: PipelineStatus[] = ['new', 'active', 'dismissed'];
const RANK_OPTIONS: { key: DriverRankBy; label: string }[] = [
  { key: 'impact', label: '$ Impact' },
  { key: 'volume', label: 'Volume' },
  { key: 'perCase', label: 'Savings/Case' },
  { key: 'repeat', label: 'Overlap' },
];

/* TabItem version for TabBar */
const RANK_TABS: TabItem<DriverRankBy>[] = RANK_OPTIONS.map(o => ({ key: o.key, label: o.label }));

/* Helper to format a row name — shows provider ID for provider modals */
const fmtRowName = (name: string, tileType: 'procedures' | 'providers' | 'opportunities') => tileType === 'providers' ? getProviderId(name) : name;

function ViewAllModal({
  title,
  icon,
  allRows,
  onClose,
  parentRankBy,
  onViewInHub,
  onViewRowInHub,
  tileType,
  initialCategory,
  initialStatus,
}: {
  title: string;
  icon: React.ReactNode;
  allRows: DriverRow[];
  onClose: () => void;
  parentRankBy: DriverRankBy;
  onViewInHub?: () => void;
  onViewRowInHub?: (rowName: string) => void;
  tileType: 'procedures' | 'providers' | 'opportunities';
  initialCategory?: OpportunityCategory | null;
  initialStatus?: PipelineStatus | null;
}) {
  const [rankBy, setRankBy] = useState<DriverRankBy>(parentRankBy);
  const [catFilter, setCatFilter] = useState<OpportunityCategory | null>(initialCategory ?? null);
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | null>(initialStatus ?? null);
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual');

  const filtered = useMemo(() => {
    let rows = allRows;
    if (catFilter) rows = rows.filter(r => r.category === catFilter);
    if (statusFilter) rows = rows.filter(r => r.status === statusFilter);
    return sortByRank(rows, rankBy, tileType);
  }, [allRows, catFilter, statusFilter, rankBy, tileType]);

  const globalMax = Math.max(
    ...filtered.map(r => {
      if (rankBy === 'volume') return r.cases;
      if (rankBy === 'perCase') return r.avgPerCase;
      if (rankBy === 'repeat') return tileType === 'providers' ? r.oppCount : r.providersImpacted;
      return r.high;
    }),
    1,
  );

  const showCategoryContext = !catFilter;

  /* Bulk "View in Hub" only when all filtered rows share the same state */
  const allSameState = filtered.length > 0 && statusFilter != null;

  /* -- Summary stats for the filtered rows (context-aware) -- */
  const summary = useMemo(() => {
    if (filtered.length === 0) return null;
    const totalImpact = filtered.reduce((s, r) => s + r.mid, 0);
    const totalVolume = filtered.reduce((s, r) => s + r.cases, 0);
    /* Median savings per case — safer than mean across mixed procedures */
    const sortedPerCase = [...filtered].map(r => r.avgPerCase).sort((a, b) => a - b);
    const medianPerCase = sortedPerCase.length % 2 === 1
      ? sortedPerCase[Math.floor(sortedPerCase.length / 2)]
      : (sortedPerCase[sortedPerCase.length / 2 - 1] + sortedPerCase[sortedPerCase.length / 2]) / 2;
    /* Top driver by current rankBy */
    const topRow = filtered[0]; // already sorted by rankBy
    /* Repeat summary */
    const maxRepeatMetric = tileType === 'providers'
      ? Math.max(...filtered.map(r => r.oppCount))
      : Math.max(...filtered.map(r => r.providersImpacted));
    const topRepeatRow = filtered.reduce((best, r) => {
      const metric = tileType === 'providers' ? r.oppCount : r.providersImpacted;
      const bestMetric = tileType === 'providers' ? best.oppCount : best.providersImpacted;
      return metric > bestMetric ? r : best;
    }, filtered[0]);
    return { totalImpact, totalVolume, medianPerCase, topRow, maxRepeatMetric, topRepeatRow };
  }, [filtered, tileType]);

  /* Dynamic subtitle describing current view */
  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (catFilter) parts.push(catFilter);
    else parts.push('All categories');
    if (statusFilter) parts.push(STATUS_META[statusFilter].label);
    else parts.push('all states');
    return parts.join(' \u00B7 ');
  }, [catFilter, statusFilter]);

  /* Download handler — exports visible rows as CSV */
  const handleDownload = () => {
    if (filtered.length === 0) return;
    const header = 'Rank,Name,Category,State,Impact ($),Volume (cases),$/Case\n';
    const csv = filtered.map((r, i) =>
      `${i + 1},"${r.name}",${r.category ?? ''},${r.status ? STATUS_META[r.status].label : ''},${Math.round(r.mid)},${r.cases},${Math.round(r.avgPerCase)}`
    ).join('\n');
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose} data-tour="view-all-modal">
      <div
        className="bg-card border border-border rounded-[var(--radius-card)] shadow-lg w-full max-w-[640px] h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-border">
          <div className="flex flex-col gap-[2px]">
            <div className="flex items-center gap-[8px]">
              <div className="size-[26px] rounded-[var(--radius-button)] bg-muted flex items-center justify-center shrink-0">
                {icon}
              </div>
              <span className="font-[family-name:var(--font-archivo)] font-[var(--font-weight-bold)] text-foreground text-[16px]">
                {title}
              </span>
              <span className="font-[family-name:var(--font-open-sans)] text-muted-foreground text-[12px] ml-[4px]">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="font-[family-name:var(--font-open-sans)] text-muted-foreground text-[11px] pl-[34px]">
              {subtitle}
            </span>
          </div>
          <div className="flex items-center gap-[4px]">
            <button
              onClick={handleDownload}
              title="Download as CSV"
              className="size-[28px] rounded-[var(--radius-button)] hover:bg-muted flex items-center justify-center cursor-pointer transition-colors"
            >
              <Download size={14} className="text-muted-foreground" />
            </button>
            <button onClick={onClose} className="size-[28px] rounded-[var(--radius-button)] hover:bg-muted flex items-center justify-center cursor-pointer transition-colors">
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Toolbar row 1: Ranked-by tabs — underline style, above filters */}
        <div className="inline-flex items-stretch h-[32px] border-b border-border">
          {([
            { key: 'impact' as DriverRankBy, label: '$ Impact' },
            { key: 'volume' as DriverRankBy, label: 'Volume' },
            { key: 'perCase' as DriverRankBy, label: 'Savings/Case' },
            { key: 'repeat' as DriverRankBy, label: 'Overlap' },
          ]).map((tab, index) => {
            const isActive = rankBy === tab.key;
            return (
              <button
                key={tab.key}
                data-tour={`modal-rank-${tab.key}`}
                onClick={() => setRankBy(tab.key)}
                className={`relative grid place-items-center cursor-pointer outline-none transition-colors h-full border-0 bg-transparent px-[24px] ${isActive ? '' : 'hover:bg-muted/40'}`}
              >
                {isActive && (
                  <div
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary pointer-events-none z-[1]"
                  />
                )}
                <span
                  className={`font-[family-name:var(--font-open-sans)] leading-[normal] shrink-0 whitespace-nowrap text-[14px] ${
                    isActive
                      ? 'font-[var(--font-weight-bold)] text-foreground'
                      : 'font-[var(--font-weight-normal)] text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar row 2: filters (States + Categories + view toggle) */}
        <div className="flex items-center gap-[8px] px-[20px] py-[8px] border-b border-border flex-wrap">
          {/* State filter chips (with per-state color) */}
          <FilterChipGroup<PipelineStatus>
            selected={statusFilter}
            onSelect={setStatusFilter}
            allLabel="All States"
            options={ALL_STATUSES.map(st => ({
              value: st,
              label: STATUS_META[st].label,
              activeColor: STATUS_META[st].color,
            }))}
          />

          <span className="w-px h-[18px] bg-border" />

          {/* Category filter chips */}
          <FilterChipGroup<OpportunityCategory>
            selected={catFilter}
            onSelect={setCatFilter}
            options={ALL_CATEGORIES.map(cat => ({
              value: cat,
              label: cat,
              icon: CATEGORY_ICON[cat],
            }))}
          />

          <span className="flex-1" />

          {/* Visual / Table toggle — icon only */}
          <div className="inline-flex items-center bg-[var(--background)] rounded-[var(--radius-button)] p-[2px] gap-[2px]">
            {([
              { value: 'visual' as const, icon: <BarChart3 size={14} />, title: 'Chart view' },
              { value: 'table' as const, icon: <Table2 size={14} />, title: 'Table view' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                data-tour={`modal-view-${opt.value}`}
                onClick={() => setViewMode(opt.value)}
                title={opt.title}
                className={`inline-flex items-center justify-center size-[24px] rounded-[var(--radius-button)] cursor-pointer transition-all ${
                  viewMode === opt.value
                    ? 'bg-accent-light shadow-sm text-[var(--primary)]'
                    : 'text-[var(--muted-foreground)] hover:bg-accent-light/50'
                }`}
              >
                {opt.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable row list */}
        <div className="flex-1 overflow-y-auto scrollbar-subtle px-[20px] pt-[4px] pb-[8px]">
          {/* Context-aware summary box — adapts to active rankBy tab */}
          {summary && (() => {
            /* Choose label, value, and top driver based on active tab */
            let kpiLabel = '';
            let kpiValue = '';
            let kpiHint = '';
            const topName = fmtRowName(summary.topRow.name, tileType);

            if (rankBy === 'impact') {
              kpiLabel = 'Total Estimated Savings';
              kpiValue = formatCurrency(summary.totalImpact);
              kpiHint = 'Sum of midpoint savings across filtered results';
            } else if (rankBy === 'volume') {
              kpiLabel = 'Total Case Volume';
              kpiValue = summary.totalVolume.toLocaleString();
              kpiHint = 'Total surgical cases across filtered results';
            } else if (rankBy === 'perCase') {
              kpiLabel = 'Median Savings per Case';
              kpiValue = fmtPerCase(summary.medianPerCase);
              kpiHint = 'Median estimated savings per surgical case (not average \u2014 less skewed by outliers)';
            } else {
              /* repeat */
              const repeatMetricLabel = tileType === 'providers' ? 'opportunities' : 'providers';
              kpiLabel = `Most ${repeatMetricLabel} impacted`;
              kpiValue = `${summary.maxRepeatMetric}`;
              kpiHint = `Highest number of ${repeatMetricLabel} associated with a single ${tileType === 'providers' ? 'provider' : 'procedure'}`;
            }

            return (
              <div className="bg-muted/50 border border-border rounded-[var(--radius-button)] px-[14px] py-[8px] my-[6px] flex items-center gap-[16px]">
                {/* Primary KPI */}
                <div className="flex flex-col gap-[1px] min-w-0" title={kpiHint}>
                  <span className="font-[family-name:var(--font-open-sans)] text-muted-foreground text-[10px]">
                    {kpiLabel}
                  </span>
                  <span className="font-[family-name:var(--font-archivo)] font-[var(--font-weight-bold)] text-foreground text-[16px] tabular-nums">
                    {kpiValue}
                  </span>
                </div>

                <span className="w-px self-stretch bg-border" />

                {/* Top driver callout */}
                <div className="flex flex-col gap-[1px] min-w-0 flex-1">
                  <span className="font-[family-name:var(--font-open-sans)] text-muted-foreground text-[10px]">
                    Top Driver
                  </span>
                  <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-accent text-[12px] truncate" title={summary.topRow.name}>
                    {topName}
                  </span>
                </div>
              </div>
            );
          })()}

          {filtered.length === 0 && (
            <div className="py-[24px] text-center">
              <span className="font-[family-name:var(--font-open-sans)] text-muted-foreground text-[12px]">
                No results match the current filters
              </span>
            </div>
          )}

          {/* ── Visual (bar chart) view ── */}
          {viewMode === 'visual' && filtered.map((r, i) => (
            <DriverRowView
              key={r.name}
              r={r}
              i={i}
              rankBy={rankBy}
              globalMax={globalMax}
              isLast={i === filtered.length - 1}
              showCategoryContext={showCategoryContext}
              onViewInHub={onViewRowInHub ? () => onViewRowInHub(r.name) : undefined}
              compact={false}
              highlightRank={3}
              isProviderRow={tileType === 'providers'}
              tileType={tileType}
            />
          ))}

          {/* ── Table view ── */}
          {viewMode === 'table' && filtered.length > 0 && (
            <div className="overflow-x-auto mt-[4px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-[8px] py-[6px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-muted-foreground text-[11px]">#</th>
                    <th className="text-left px-[8px] py-[6px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-muted-foreground text-[11px]">Name</th>
                    <th className="text-left px-[8px] py-[6px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-muted-foreground text-[11px]">Category</th>
                    <th className="text-left px-[8px] py-[6px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-muted-foreground text-[11px]">State</th>
                    <th className="text-right px-[8px] py-[6px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-muted-foreground text-[11px]">Impact ($)</th>
                    <th className="text-right px-[8px] py-[6px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-muted-foreground text-[11px]">Cases</th>
                    <th className="text-right px-[8px] py-[6px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-muted-foreground text-[11px]">$/Case</th>
                    <th className="px-[8px] py-[6px]" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const statusMeta = r.status ? STATUS_META[r.status] : null;
                    return (
                      <tr key={r.name} className={`border-b border-border hover:bg-muted/20 transition-colors ${i < 3 ? 'bg-accent/[0.03]' : ''}`}>
                        <td className="px-[8px] py-[6px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-bold)] text-muted-foreground text-[12px] tabular-nums">{i + 1}</td>
                        <td className="px-[8px] py-[6px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-foreground text-[12px] max-w-[180px] truncate">
                          {tileType === 'providers' ? (
                            <DarkTooltip content={getProviderName(r.name)}>
                              <span className="cursor-default">{getProviderId(r.name)}</span>
                            </DarkTooltip>
                          ) : r.name}
                        </td>
                        <td className="px-[8px] py-[6px]">
                          {r.category && (
                            <span className="inline-flex items-center gap-[3px] font-[family-name:var(--font-open-sans)] text-muted-foreground text-[11px]">
                              {CATEGORY_ICON[r.category]}
                              {r.category}
                            </span>
                          )}
                        </td>
                        <td className="px-[8px] py-[6px]">
                          {statusMeta && (
                            <span
                              className="inline-flex items-center px-[6px] py-[1px] rounded-[var(--radius-button)] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-[10px]"
                              style={{ backgroundColor: `${statusMeta.color}18`, color: statusMeta.color }}
                            >
                              {statusMeta.label}
                            </span>
                          )}
                        </td>
                        <td className="px-[8px] py-[6px] text-right font-[family-name:var(--font-archivo)] font-[var(--font-weight-bold)] text-foreground text-[12px] tabular-nums">{formatCurrency(r.mid)}</td>
                        <td className="px-[8px] py-[6px] text-right font-[family-name:var(--font-open-sans)] text-foreground text-[12px] tabular-nums">{r.cases.toLocaleString()}</td>
                        <td className="px-[8px] py-[6px] text-right font-[family-name:var(--font-open-sans)] text-foreground text-[12px] tabular-nums">{fmtPerCase(r.avgPerCase)}</td>
                        <td className="px-[8px] py-[6px]">
                          {onViewRowInHub && (
                            <button
                              onClick={() => onViewRowInHub(r.name)}
                              title="View in Opportunities Hub"
                              className="group/hub shrink-0 size-[20px] rounded-[var(--radius-button)] hover:bg-muted flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <ExternalLink size={11} className="text-muted-foreground group-hover/hub:text-accent transition-colors" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal footer: bulk View in Hub — only when all rows share same state */}
        {allSameState && onViewInHub && (
          <div className="flex items-center justify-end px-[20px] py-[10px] border-t border-border">
            <button
              onClick={onViewInHub}
              className="inline-flex items-center gap-[4px] cursor-pointer bg-transparent hover:opacity-80 transition-opacity"
              data-tour="view-in-hub-btn"
            >
              <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-accent text-[11px]">
                View All in Hub
              </span>
              <ArrowRight size={12} className="text-accent" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================= */
/*  DriverTile                                                        */
/* ================================================================= */
function DriverTile({
  title,
  subtitle,
  icon,
  rows,
  allRows,
  fullRows,
  isActive,
  isAggregate,
  onViewInHub,
  onViewRowInHub,
  tileType,
  rankBy,
  showDivider,
  selection,
  barColor,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  rows: DriverRow[];
  allRows: DriverRow[];
  fullRows: DriverRow[];
  isActive: boolean;
  isAggregate: boolean;
  onViewInHub?: () => void;
  onViewRowInHub?: (rowName: string) => void;
  tileType: 'procedures' | 'providers' | 'opportunities';
  rankBy: DriverRankBy;
  showDivider?: boolean;
  selection: BucketSelection | null;
  barColor?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  /* Global max for zero-based bar scaling -- adapts to rankBy */
  const globalMax = Math.max(...rows.map(r => {
    if (rankBy === 'volume') return r.cases;
    if (rankBy === 'perCase') return r.avgPerCase;
    if (rankBy === 'repeat') return tileType === 'providers' ? r.oppCount : r.providersImpacted;
    return r.high;
  }), 1);

  const showCategoryContext = !selection;

  /*
   * Bulk "View in Hub" in footer: only when all visible rows share the
   * same state — i.e. a specific status bucket was selected upstream.
   */
  const allSameState = !!selection?.status;

  return (
    <>
      <div
        className={`flex flex-col px-[14px] pt-[4px] pb-[10px] h-full overflow-hidden rounded-[0px] transition-all duration-200 ${showDivider ? 'border-l border-border' : ''}`}
      >
        {/* Tile header */}
        <div className="flex items-center justify-between mb-[2px]">
          <div className="flex items-center gap-[6px]">
            <div className="size-[22px] rounded-[var(--radius-button)] bg-muted flex items-center justify-center shrink-0">
              {icon}
            </div>
            <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-bold)] text-foreground text-[16px]">
              {title}
            </span>
          </div>
        </div>
        {/* Subtitle */}
        <span className="font-[family-name:var(--font-open-sans)] text-muted-foreground text-[13px] pl-[28px] mx-[0px] mt-[0px] mb-[2px]">
          {subtitle}
        </span>
        {/* Separator line between header and content */}
        <div className="border-b border-border mb-[4px]" />

        {/* Rows */}
        <div className="flex flex-col flex-1">
          {rows.length === 0 && (
            <span className="font-[family-name:var(--font-open-sans)] text-muted-foreground text-[11px] py-[8px]">
              No opportunities
            </span>
          )}
          {rows.map((r, i) => (
            <DriverRowView
              key={r.name}
              r={r}
              i={i}
              rankBy={rankBy}
              globalMax={globalMax}
              isLast={i === rows.length - 1}
              showCategoryContext={showCategoryContext}
              onViewInHub={onViewRowInHub ? () => onViewRowInHub(r.name) : undefined}
              compact={true}
              isProviderRow={tileType === 'providers'}
              tileType={tileType}
              barColor={barColor}
            />
          ))}
        </div>

        {/* Footer: View All + bulk View in Hub (only when same state) */}
        {rows.length > 0 && (
          <div className={`flex items-center ${allSameState && onViewInHub ? 'justify-between' : 'justify-start'} mt-[4px] border-t border-border px-[0px] pt-[12px] pb-[0px]`}>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-[4px] cursor-pointer bg-transparent hover:opacity-80 transition-opacity"
              data-tour={`${tileType}-view-all`}
            >
              <List size={12} className="text-accent" />
              <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-accent text-[13px]">
                View All
              </span>
            </button>
            {allSameState && onViewInHub && (
              <button
                onClick={onViewInHub}
                className="inline-flex items-center gap-[4px] cursor-pointer bg-transparent hover:opacity-80 transition-opacity"
              >
                <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-accent text-[11px]">
                  View in Hub
                </span>
                <ArrowRight size={12} className="text-accent" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* View All Modal */}
      {modalOpen && (
        <ViewAllModal
          title={title.replace('Top ', 'All ')}
          icon={icon}
          allRows={fullRows}
          onClose={() => setModalOpen(false)}
          parentRankBy={rankBy}
          onViewInHub={onViewInHub}
          onViewRowInHub={onViewRowInHub}
          tileType={tileType}
          initialCategory={selection?.category}
          initialStatus={selection?.status}
        />
      )}
    </>
  );
}

/* ================================================================= */
/*  ViewTilesDropdown — multiselect (SortDropdown pattern)            */
/* ================================================================= */
type TileKey = 'procedures' | 'providers' | 'opportunities';

const TILE_OPTIONS: { key: TileKey; label: string; icon: React.ReactNode }[] = [
  { key: 'procedures', label: 'Procedures', icon: <Stethoscope size={12} /> },
  { key: 'providers', label: 'Providers', icon: <Users size={12} /> },
  { key: 'opportunities', label: 'Opportunities', icon: <Lightbulb size={12} /> },
];

function ViewTilesDropdown({
  visibleTiles,
  onToggle,
}: {
  visibleTiles: Set<TileKey>;
  onToggle: (tile: TileKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const allSelected = visibleTiles.size === TILE_OPTIONS.length;

  const handleSelectAll = () => {
    TILE_OPTIONS.forEach(t => {
      if (!visibleTiles.has(t.key)) onToggle(t.key);
    });
  };

  /* Checkbox with SVG checkmark — mirrors FilterPanel exactly */
  const TileCheckbox = ({ checked }: { checked: boolean }) => (
    <div className="relative shrink-0 size-[16px]">
      <div className={`absolute inset-0 rounded-[3px] ${checked ? 'bg-primary' : 'border border-border'}`} />
      {checked && (
        <div className="absolute inset-[13.64%_13.64%_18.18%_18.18%] overflow-clip">
          <div className="absolute inset-[18.93%_8.33%]">
            <svg className="absolute block size-full" fill="none" viewBox="0 0 11.3636 8.474">
              <path d={filterSvgPaths.p62edfc0} fill="white" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );

  const activeLabel = allSelected
    ? 'All'
    : TILE_OPTIONS.filter(t => visibleTiles.has(t.key)).map(t => t.label).join(', ');

  return (
    <div ref={containerRef} className="flex gap-[8px] items-center relative shrink-0 z-[1]">
      <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] leading-[normal] shrink-0 text-muted-foreground text-[13px]">
        View:
      </span>
      <div className="bg-card flex flex-col items-start relative shrink-0">
        {/* Trigger — FilterPanel MultiSelectDropdown style */}
        <div className="bg-card flex flex-col h-[32px] items-center justify-center relative shrink-0 w-full">
          <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
          <div className="h-[28px] relative shrink-0 w-full">
            <div className="flex flex-row items-center size-full">
              <div className="flex gap-[4px] items-center px-[8px] py-[4px] relative size-full">
                <div className="flex flex-1 gap-[4px] items-center min-w-0">
                  {visibleTiles.size > 1 && !allSelected && (
                    <div className="bg-[rgba(0,174,255,0.3)] flex items-center justify-center px-[4px] py-[2px] rounded-[5px] shrink-0">
                      <span className="font-[family-name:var(--font-open-sans)] leading-[normal] text-foreground text-[13px] text-center">
                        {visibleTiles.size}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col items-start justify-center min-w-0">
                    <div className="h-[26px] relative rounded-[5px] shrink-0 w-full">
                      <div className="flex flex-row items-center size-full">
                        <div className="flex items-center gap-[6px] px-[4px] py-[2px] size-full">
                          <Eye size={12} className="text-muted-foreground shrink-0" />
                          <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] leading-[normal] text-foreground text-[13px] truncate">
                            {activeLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-[4px] items-center shrink-0">
                  <button type="button" onClick={() => setOpen(v => !v)} className="cursor-pointer bg-transparent border-0 outline-none p-0">
                    <div className={`h-[17px] overflow-clip relative shrink-0 w-[16px] transition-transform duration-150 ${open ? '-scale-y-100' : ''}`}>
                      <div className="absolute inset-[24.71%_8.33%]">
                        <svg className="absolute block size-full" fill="none" viewBox="0 0 13.3333 8.71399">
                          <path d={filterSvgPaths.p16ee1b80} fill="var(--primary)" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown panel — FilterPanel MultiSelectDropdown style */}
        {open && (
          <div className="absolute top-[34px] right-0 bg-card border border-border rounded-[var(--radius-button)] shadow-[var(--elevation-sm)] min-w-[200px] z-50 max-h-[200px] overflow-y-auto">
            {/* "View All" — always present at top */}
            <div
              onClick={handleSelectAll}
              className={`px-[8px] py-[6px] cursor-pointer flex items-center gap-[8px] hover:bg-muted font-[family-name:var(--font-open-sans)] text-[13px] text-foreground border-b border-border ${
                allSelected ? 'bg-[rgba(0,174,255,0.08)]' : ''
              }`}
            >
              <TileCheckbox checked={allSelected} />
              <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-foreground text-[13px]">View All</span>
            </div>
            {/* Individual tile options */}
            {TILE_OPTIONS.map(option => {
              const isOn = visibleTiles.has(option.key);
              const isOnly = isOn && visibleTiles.size === 1;
              return (
                <div
                  key={option.key}
                  onClick={() => { if (!isOnly) onToggle(option.key); }}
                  className={`px-[8px] py-[6px] flex items-center gap-[8px] font-[family-name:var(--font-open-sans)] text-[13px] text-foreground ${
                    isOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'
                  } ${isOn ? 'bg-[rgba(0,174,255,0.08)]' : ''}`}
                >
                  <TileCheckbox checked={isOn} />
                  <span className="flex items-center gap-[6px]">
                    <span className="shrink-0 text-muted-foreground">{option.icon}</span>
                    {option.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================= */
/*  TopDriversPanel (main export)                                     */
/* ================================================================= */
export default function TopDriversPanel({ opportunities, selection, onViewAll, onViewRowInHub }: Props) {
  const [rankBy, setRankBy] = useState<DriverRankBy>('impact');
  const [visibleTiles, setVisibleTiles] = useState<Set<'procedures' | 'providers' | 'opportunities'>>(
    new Set(['procedures', 'providers', 'opportunities']),
  );
  const bucket = useMemo(() => filterBucket(opportunities, selection), [opportunities, selection]);
  const proceduresAll = useMemo(() => topProcedures(bucket), [bucket]);
  const providersAll = useMemo(() => topProviders(bucket), [bucket]);
  const oppsAll = useMemo(() => topOpportunities(bucket), [bucket]);

  /* Full (unfiltered) aggregations — used by ViewAllModal so the user can
     adjust category/status filters freely inside the modal */
  const proceduresFull = useMemo(() => topProcedures(opportunities), [opportunities]);
  const providersFull = useMemo(() => topProviders(opportunities), [opportunities]);
  const oppsFull = useMemo(() => topOpportunities(opportunities), [opportunities]);

  /* Apply rankBy sorting and take top 3 for tiles */
  const procedures = useMemo(() => sortByRank(proceduresAll, rankBy, 'procedures').slice(0, 3), [proceduresAll, rankBy]);
  const providers = useMemo(() => sortByRank(providersAll, rankBy, 'providers').slice(0, 3), [providersAll, rankBy]);
  const opps = useMemo(() => sortByRank(oppsAll, rankBy, 'opportunities').slice(0, 3), [oppsAll, rankBy]);
  const isActive = selection?.status === 'active';

  /* Toggle a tile's visibility (but prevent hiding all) */
  const toggleTile = (tile: 'procedures' | 'providers' | 'opportunities') => {
    setVisibleTiles(prev => {
      const next = new Set(prev);
      if (next.has(tile)) {
        if (next.size <= 1) return prev; // must keep at least one
        next.delete(tile);
      } else {
        next.add(tile);
      }
      return next;
    });
  };

  const visibleCount = visibleTiles.size;
  const gridColsClass =
    visibleCount === 1 ? 'md:grid-cols-1' :
    visibleCount === 2 ? 'md:grid-cols-2' :
    'md:grid-cols-3';

  /* Card-level selection hint: grey border-top + shadow */
  const hasSelection = !!selection;

  /* Bar color derived from selection: status-specific color, category-only = muted, no selection = default chart color */
  const selectionBarColor = selection
    ? (selection.status ? STATUS_META[selection.status].color : 'var(--muted-foreground)')
    : undefined; /* undefined → falls back to var(--chart-1) in DriverRowView */

  return (
    <div className="flex flex-col gap-[8px] h-full">
      {/* Header: "Selected" + badge chips + View dropdown (top right) */}
      <div className="flex items-center gap-[6px] px-[4px] flex-wrap">
        <span className="font-[family-name:var(--font-archivo)] font-[var(--font-weight-bold)] text-foreground text-[18px] tracking-wide">
          Selected
        </span>

        {selection ? (() => {
          const stateColor = selection.status
            ? STATUS_META[selection.status].color
            : 'var(--muted-foreground)';
          const stateHex = selection.status
            ? STATUS_META[selection.status].color
            : 'var(--muted-foreground)';
          const label = selection.status
            ? `${selection.category} \u00B7 ${STATUS_META[selection.status].label}`
            : `${selection.category} \u00B7 All States`;
          return (
            <span
              className="inline-flex items-center gap-[5px] rounded-[var(--radius-button)] px-[8px] py-[2px] font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-[11px]"
              style={{
                backgroundColor: `color-mix(in srgb, ${stateHex} 12%, transparent)`,
                color: stateColor,
                border: `1px solid color-mix(in srgb, ${stateHex} 25%, transparent)`,
              }}
            >
              {CATEGORY_ICON[selection.category]}
              {label}
            </span>
          );
        })() : (
          <span className="inline-flex items-center rounded-[var(--radius-button)] px-[8px] py-[2px] bg-muted font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-muted-foreground text-[12px]">
            All Categories
          </span>
        )}

        {/* Spacer */}
        <span className="flex-1" />

        {/* View: multiselect dropdown (SortDropdown pattern from Top3Panes) */}
        <ViewTilesDropdown visibleTiles={visibleTiles} onToggle={toggleTile} />
      </div>

      {/* Triptych — single card with vertical dividers */}
      <div
        className={`bg-card border border-border rounded-[var(--radius-card)] grid grid-cols-1 ${gridColsClass} items-start content-start flex-1 overflow-hidden`}
        style={hasSelection ? {
          boxShadow: `inset 0 3px 0 0 ${
            selection?.status
              ? STATUS_META[selection.status].color
              : 'var(--muted-foreground)'
          }, 0 2px 12px 0 rgba(0,0,0,0.08), 0 0 0 1px var(--border)`,
        } : undefined}
      >
        {/* AI Insight Banner — adapts to current bucket selection */}
        {(() => {
          const topImpact = sortByRank(proceduresAll, 'impact', 'procedures')[0];
          const topRepeatProvider = sortByRank(providersAll, 'repeat', 'providers')[0];

          if (!topImpact) return null;

          const totalSavings = proceduresAll.reduce((s, r) => s + r.mid, 0);
          const topImpactPct = totalSavings > 0
            ? Math.round((topImpact.mid / totalSavings) * 100)
            : 0;

          const topVolumeProc = sortByRank(proceduresAll, 'volume', 'procedures')[0];
          const topPerCaseOpp = sortByRank(oppsAll, 'perCase', 'opportunities')[0];

          /* Build a context prefix based on current bucket selection */
          const contextPrefix = selection
            ? `Within ${selection.category}${selection.status ? ` \u00B7 ${STATUS_META[selection.status].label}` : ''}`
            : 'Across all categories';

          const inlineLinkClass = 'font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-[var(--accent)] text-[12px] underline underline-offset-[2px] decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] transition-colors bg-transparent border-0 p-0 cursor-pointer';

          return (
            <div
              className="col-span-full border-b border-border px-[14px] py-[10px] flex items-start gap-[10px]"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 5%, transparent)' }}
            >
              <Sparkles size={14} className="text-[var(--accent)] shrink-0 mt-[2px]" />
              <p className="font-[family-name:var(--font-open-sans)] text-[var(--foreground)] leading-[18px] m-0 min-w-0 text-[13px]">
                <span className="text-[var(--muted-foreground)]">{contextPrefix},</span>{' '}
                {onViewRowInHub ? (
                  <button
                    type="button"
                    onClick={() => onViewRowInHub(topImpact.name, 'procedures')}
                    className={inlineLinkClass}
                  >
                    {topImpact.name}
                  </button>
                ) : (
                  <span className="font-[var(--font-weight-semibold)]">{topImpact.name}</span>
                )}
                {' '}drives the largest savings potential
                {topImpactPct > 0 && ` (${topImpactPct}% of ${formatCurrency(totalSavings)} total)`}
                {topVolumeProc && topVolumeProc.name !== topImpact.name && (
                  <>
                    {', '}
                    {onViewRowInHub ? (
                      <button
                        type="button"
                        onClick={() => onViewRowInHub(topVolumeProc.name, 'procedures')}
                        className={inlineLinkClass}
                      >
                        {topVolumeProc.name}
                      </button>
                    ) : (
                      <span className="font-[var(--font-weight-semibold)]">{topVolumeProc.name}</span>
                    )}
                    {` has the highest case volume (${topVolumeProc.cases.toLocaleString()} cases)`}
                  </>
                )}
                {topPerCaseOpp && topPerCaseOpp.name !== topImpact.name && topPerCaseOpp.name !== topVolumeProc?.name && (
                  <>
                    {', '}
                    {onViewRowInHub ? (
                      <button
                        type="button"
                        onClick={() => onViewRowInHub(topPerCaseOpp.name, 'opportunities')}
                        className={inlineLinkClass}
                      >
                        {topPerCaseOpp.name}
                      </button>
                    ) : (
                      <span className="font-[var(--font-weight-semibold)]">{topPerCaseOpp.name}</span>
                    )}
                    {` has the best savings/case (${fmtPerCase(topPerCaseOpp.avgPerCase)})`}
                  </>
                )}
                {topRepeatProvider && (
                  <>
                    {', and '}
                    {onViewRowInHub ? (
                      <button
                        type="button"
                        onClick={() => onViewRowInHub(topRepeatProvider.name, 'providers')}
                        className={inlineLinkClass}
                      >
                        {getProviderId(topRepeatProvider.name)}
                      </button>
                    ) : (
                      <span className="font-[var(--font-weight-semibold)]">{getProviderId(topRepeatProvider.name)}</span>
                    )}
                    {' '}has the most repeat opportunities ({topRepeatProvider.oppCount}).
                  </>
                )}
              </p>
            </div>
          );
        })()}

        {/* Show: rank-by tabs (moved inside card) */}
        <div className="col-span-full border-b border-border px-[10px] h-[44px]">
          <InlineTabBar<DriverRankBy>
            tabs={RANK_TABS}
            activeKey={rankBy}
            onTabChange={setRankBy}
            label="Show:"
            className="h-[44px]"
          />
        </div>

        {/* Orienting question + subtitle — driven by active rankBy tab */}
        <div className="col-span-full border-b border-border px-[14px] py-[12px]" style={{ backgroundColor: 'color-mix(in srgb, var(--muted) 40%, transparent)' }}>
          <p className="font-[family-name:var(--font-archivo)] font-[var(--font-weight-bold)] text-foreground leading-[18px] m-0 text-[18px]">
            {rankBy === 'impact' && 'Where is the biggest savings opportunity?'}
            {rankBy === 'volume' && 'Where is the most scale to influence?'}
            {rankBy === 'perCase' && 'Where is the biggest gap per case?'}
            {rankBy === 'repeat' && 'Where do we see the most repeat involvement?'}
          </p>
          <p className="font-[family-name:var(--font-open-sans)] text-muted-foreground leading-[16px] m-0 mt-[2px] text-[13px] px-[0px] pt-[4px] pb-[0px]">
            {rankBy === 'impact' && 'Ranked by total modeled $ impact in the current selection.'}
            {rankBy === 'volume' && 'Ranked by eligible case volume.'}
            {rankBy === 'perCase' && 'Ranked by estimated savings per comparable case \u2014 good for finding \"big leaks,\" even at lower volume.'}
            {rankBy === 'repeat' && 'Same names appearing again and again = higher standardization potential.'}
          </p>
        </div>

        {visibleTiles.has('procedures') && (
          <DriverTile
            title="Top Procedures"
            subtitle={rankBy === 'repeat'
              ? 'Procedures involving the most providers'
              : rankBy === 'volume'
              ? 'Procedures with the highest eligible case volume'
              : rankBy === 'perCase'
              ? 'Procedures with the largest per-case savings gap'
              : 'Highest-cost procedures by savings potential'}
            icon={<Stethoscope size={12} className="text-muted-foreground" />}
            rows={procedures}
            allRows={proceduresAll}
            fullRows={proceduresFull}
            isActive={isActive}
            isAggregate={true}
            onViewInHub={onViewAll ? () => onViewAll('procedures') : undefined}
            onViewRowInHub={onViewRowInHub ? (rowName) => onViewRowInHub(rowName, 'procedures') : undefined}
            tileType="procedures"
            rankBy={rankBy}
            showDivider={false}
            selection={selection}
            barColor={selectionBarColor}
          />
        )}
        {visibleTiles.has('providers') && (
          <DriverTile
            title="Top Providers"
            subtitle={rankBy === 'repeat'
              ? 'Providers appearing in the most opportunities'
              : rankBy === 'volume'
              ? 'Providers with the highest eligible case volume'
              : rankBy === 'perCase'
              ? 'Providers with the largest per-case savings gap'
              : 'Providers with the most savings opportunity'}
            icon={<Users size={12} className="text-muted-foreground" />}
            rows={providers}
            allRows={providersAll}
            fullRows={providersFull}
            isActive={isActive}
            isAggregate={true}
            onViewInHub={onViewAll ? () => onViewAll('providers') : undefined}
            onViewRowInHub={onViewRowInHub ? (rowName) => onViewRowInHub(rowName, 'providers') : undefined}
            tileType="providers"
            rankBy={rankBy}
            showDivider={true}
            selection={selection}
            barColor={selectionBarColor}
          />
        )}
        {visibleTiles.has('opportunities') && (
          <DriverTile
            title="Top Opportunities"
            subtitle={rankBy === 'repeat'
              ? 'Opportunities involving the most providers'
              : rankBy === 'volume'
              ? 'Opportunities with the highest eligible case volume'
              : rankBy === 'perCase'
              ? 'Opportunities with the largest per-case savings gap'
              : 'Individual opportunities ranked by potential'}
            icon={<Lightbulb size={12} className="text-muted-foreground" />}
            rows={opps}
            allRows={oppsAll}
            fullRows={oppsFull}
            isActive={isActive}
            isAggregate={false}
            onViewInHub={onViewAll ? () => onViewAll('opportunities') : undefined}
            onViewRowInHub={onViewRowInHub ? (rowName) => onViewRowInHub(rowName, 'opportunities') : undefined}
            tileType="opportunities"
            rankBy={rankBy}
            showDivider={true}
            selection={selection}
            barColor={selectionBarColor}
          />
        )}
      </div>
    </div>
  );
}
