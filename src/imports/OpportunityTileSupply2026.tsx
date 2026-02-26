import { ChevronDown, ChevronUp, DollarSign, User, Users } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import PopOverCpTmultiple from "./PopOverCpTmultiple";
import svgPaths from "./svg-8vvl68sdg3";
import { generateOpportunityReport } from '@/app/utils/reportGenerator';
import type { OpportunityCardData, AdjunctService, ProviderProfile } from '@/app/data/opportunity-card-schema';

/* Re-exported badge components (used by Frame4535610 etc.) */

export function PriceDrivenBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`px-1.5 py-0.5 rounded-[var(--radius-button)] text-[10px] font-bold whitespace-nowrap bg-[#EBF9FF] font-[family-name:var(--font-open-sans)] ${className} text-[#516d6e]`}>
      Price-Driven
    </div>
  );
}

export function UseDrivenBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`px-1.5 py-0.5 rounded-[var(--radius-button)] text-[10px] font-bold whitespace-nowrap bg-[#F2F0FF] font-[family-name:var(--font-open-sans)] ${className} text-[#6d6e70]`}>
      Use-Driven
    </div>
  );
}

export function StatusBadge({ children, className = "", variant = "neutral" }: { children: React.ReactNode, className?: string, variant?: "neutral" | "primary" | "secondary" }) {
  const variants = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary"
  };
  return (
    <div className={`px-1.5 py-0.5 rounded-[var(--radius-button)] font-bold whitespace-nowrap font-[family-name:var(--font-open-sans)] ${variant === 'secondary' ? 'bg-[#2CA02C]/10 text-secondary' : variants[variant]} ${className} text-[#333333e6] text-[11px]`}>
      {children}
    </div>
  );
}

/* Shared icon primitives */

function InfoIcon() {
  return (
    <div className="relative shrink-0 size-6 flex items-center justify-center rounded-[var(--radius-button)] bg-transparent text-muted-foreground" data-name="info">
      <svg className="block size-3.5" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 14 14">
        <path d={svgPaths.p10e14600} fill="currentColor" id="Vector" />
      </svg>
    </div>
  );
}

function ArrowTrendUp() {
  return (
    <div className="aspect-[32/28.44444465637207] relative shrink-0 w-full" data-name="arrow-trend-up">
      <div className="absolute inset-[18.75%_0_18.75%_-0.01%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0018 7.77717">
          <path d={svgPaths.p3373fe80} fill="currentColor" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function ArrowTrendDown() {
  return (
    <div className="aspect-[32/28.44444465637207] relative shrink-0 w-full" data-name="arrow-trend-down">
      <div className="absolute inset-[18.75%_0_18.75%_-0.01%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0018 7.77717">
          <path d={svgPaths.p178c9900} fill="currentColor" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function HighCostIcon() {
  return (
    <div className="bg-destructive/10 text-destructive content-stretch flex flex-col items-center justify-center px-[5px] py-[4px] relative rounded-[var(--radius-button)] shrink-0 size-[24px]">
      <ArrowTrendUp />
    </div>
  );
}

function LowCostIcon() {
  return (
    <div className="bg-secondary/10 text-secondary content-stretch flex flex-col items-center justify-center px-[5px] py-[4px] relative rounded-[var(--radius-button)] shrink-0 size-[24px]">
      <ArrowTrendDown />
    </div>
  );
}

function CostSavingsIcon() {
  return (
    <div className="relative shrink-0 size-6 flex items-center justify-center" data-name="Cost Savings Icon">
      <div className="absolute inset-0 bg-background rounded-[var(--radius-button)]" />
      <DollarSign className="relative block size-3.5 text-muted-foreground" />
    </div>
  );
}

function SuppliesIconVector() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Supplies Icon Vector">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Supplies Icon Vector">
          <path d={svgPaths.p1aff4600} fill="var(--fill-0, #6D6E70)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SuppliesIcon() {
  return (
    <div className="relative shrink-0 size-6 flex items-center justify-center" data-name="Supplies Icon">
      <div className="absolute inset-0 bg-[#F0F3F6] rounded-[var(--radius-button)]" />
      <div className="relative block size-[18px]">
        <SuppliesIconVector />
      </div>
    </div>
  );
}

/** Shared KPI column header */
function KpiHeader({ icon, label, rightContent }: { icon: React.ReactNode; label: string; rightContent?: React.ReactNode }) {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="KpiHeader">
      <div className={`content-stretch flex items-center pt-[2px] px-[4px] relative size-full ${rightContent ? 'justify-between' : ''}`}>
        <div className="flex gap-[4px] items-center">
          {icon}
          <span className="font-[family-name:var(--font-open-sans)] font-[var(--font-weight-semibold)] text-[length:var(--text-xs)] text-muted-foreground uppercase leading-[14px] whitespace-nowrap">
            {label}
          </span>
        </div>
        {rightContent}
      </div>
    </div>
  );
}

/* Header region */

function Subtitle({ procedureTitle, adjunctServices }: { procedureTitle: string; adjunctServices: AdjunctService[] }) {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 pl-[2px]" data-name="Subtitle">
      <div className="capitalize flex flex-col font-[var(--font-open-sans)] font-semibold justify-center leading-[0] overflow-hidden relative shrink-0 text-foreground text-[15px] text-ellipsis">
        <div className="leading-[20px] px-[0px] py-[2px]">
          <span className="font-[family-name:var(--font-archivo)] text-[16px] font-bold inline">{procedureTitle.toLowerCase()}</span>
          {' '}
          <Popover.Root>
            <Popover.Trigger asChild>
              
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="z-[300] bg-card p-4 rounded-[var(--radius-card)] border border-border shadow-xl w-[320px] animate-in fade-in zoom-in-95 duration-200" sideOffset={8} align="start">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="font-[var(--font-open-sans)] font-bold text-[14px] text-foreground">Adjunct Services</h3>
                    <Popover.Close className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-sm hover:bg-muted transition-colors">
                       <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </Popover.Close>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 mt-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase border-b border-border pb-1">Procedure Description</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase border-b border-border pb-1 text-right">CPT Code</div>
                    {adjunctServices.map((svc) => (
                      <React.Fragment key={svc.cptCode}>
                        <div className="text-[12px] font-[var(--font-open-sans)] text-foreground">{svc.description}</div>
                        <div className="text-[12px] font-[var(--font-open-sans)] text-muted-foreground text-right">{svc.cptCode}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <Popover.Arrow className="fill-border" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

function TagsRow({ data }: { data: OpportunityCardData }) {
  return (
    <div className="content-stretch flex gap-0 h-full items-center relative shrink-0" data-name="Tags Container">
      <div className="content-stretch flex gap-[12px] h-[28px] items-center relative shrink-0" data-name="Tag 1">
        <div className="flex gap-[4px] h-[24px] items-center relative shrink-0" data-name="chip-code">
          <div className="w-[1px] h-[12px] bg-border mx-2" />
          <div className="flex flex-col font-[var(--font-open-sans)] font-normal justify-center leading-[0] relative shrink-0 text-muted-foreground text-[13px] whitespace-nowrap">
            <p className="leading-[16px] px-[4px] py-[0px] font-[family-name:var(--font-open-sans)]">{data.setting}</p>
          </div>
          <div className="w-[1px] h-[12px] bg-border mx-2" />
        </div>
      </div>
      <div className="content-stretch flex gap-[12px] h-[28px] items-center relative shrink-0" data-name="Tag 2">
        <div className="flex items-center relative shrink-0">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="bg-[var(--background)] content-stretch flex gap-[8px] h-[26px] items-center relative rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:bg-[#E5E9EF] transition-colors outline-none focus:ring-2 focus:ring-primary/20 [&_div]:bg-transparent px-[16px] py-[0px]" data-name="chip-code">
                <div className="flex flex-col font-[var(--font-open-sans)] font-normal justify-center leading-[0] relative shrink-0 text-foreground text-[13px] whitespace-nowrap">
                  <p className="leading-[16px] font-[family-name:var(--font-open-sans)]">{`Procedure `}</p>
                </div>
                <InfoIcon />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="z-50 animate-in fade-in zoom-in-95 duration-200" sideOffset={8} align="start">
                <PopOverCpTmultiple
                   procedure={data.procedureName}
                   procId={data.opportunityId}
                   setting={data.setting}
                   cpts={data.cptCodes}
                   drgs={data.drgCodes}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <div className="w-[1px] h-[12px] bg-border mx-2" />
        </div>
      </div>
    </div>
  );
}

function HeaderSection({ data }: { data: OpportunityCardData }) {
  return (
    <div className="content-stretch flex h-auto items-center justify-between relative shrink-0 w-full py-[2px]" data-name="header">
      <div className="content-stretch flex flex-col gap-[2px] h-full relative flex-1 min-w-0" data-name="Title">
        <div className="flex items-center gap-[16px] w-full p-[0px]">
          <div className="flex items-center gap-[6px] h-[22px] rounded-[var(--radius-button)] shrink-0 bg-[#ffffff] px-[0px] py-[4px]">
            <span className="block size-[8px] rounded-full bg-[var(--brand-purple)] shrink-0" />
            <span className="text-[var(--brand-purple)] whitespace-nowrap leading-[14px] px-[0px] py-[2px] font-[family-name:var(--font-open-sans)] text-[13px]">{data.category}</span>
          </div>
          <TagsRow data={data} />
        </div>
        <Subtitle procedureTitle={data.procedureTitle} adjunctServices={data.adjunctServices} />
      </div>
      <div className="content-stretch flex gap-[16px] h-full items-center justify-center relative shrink-0" data-name="button" />
    </div>
  );
}

function ProviderPopover({ profile, type }: { profile: ProviderProfile; type: "high" | "low" }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="bg-[#F0F3F6] h-[24px] px-[8px] relative rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:bg-[#E5E9EF] transition-colors outline-none focus:ring-2 focus:ring-primary/20 py-[0px] [&_div]:bg-transparent">
          <div className="flex flex-row items-center justify-center size-full">
            <div className="content-stretch flex gap-[6px] items-center justify-center relative size-full">
              <User className="size-3.5 text-muted-foreground" />
              <p className="font-normal leading-[16px] relative shrink-0 text-muted-foreground text-[12px] font-[family-name:var(--font-open-sans)]">
                {profile.id}
              </p>
            </div>
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 animate-in fade-in zoom-in-95 duration-200 bg-card p-4 rounded-[var(--radius-card)] shadow-xl border border-border w-[280px]" sideOffset={5} align="end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-full flex items-center justify-center text-white font-bold ${type === 'high' ? 'bg-destructive' : 'bg-secondary'} font-[family-name:var(--font-archivo)] text-[20px]`}>
                {profile.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-[family-name:var(--font-open-sans)] font-bold text-sm text-foreground">{profile.name}</h4>
                <p className="font-[family-name:var(--font-open-sans)] text-xs text-muted-foreground">{profile.specialty}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs border-b border-border pb-1">
                <span className="font-[family-name:var(--font-open-sans)] text-muted-foreground">Provider ID</span>
                <span className="font-[family-name:var(--font-open-sans)] font-medium text-foreground">{profile.id}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-[family-name:var(--font-open-sans)] text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Practice Sites</p>
              {profile.practiceSites.map((loc) => (
                <div key={loc} className="flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="font-[family-name:var(--font-open-sans)] text-[11px] text-foreground">{loc}</span>
                </div>
              ))}
            </div>
          </div>
          <Popover.Arrow className="fill-card" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function SavingsKpi({ data }: { data: OpportunityCardData }) {
  return (
    <div className="bg-[rgba(240,243,246,0.5)] content-stretch flex flex-col h-[132px] items-center max-h-[164px] min-h-[124px] relative rounded-[4px] shrink-0 w-[218px]" data-name="Container">
      <KpiHeader icon={<CostSavingsIcon />} label="Savings Opportunity" />
      <div className="h-[92px] relative shrink-0 w-full" data-name="value">
        <div className="flex flex-col items-end size-full">
          <div className="content-stretch flex flex-col items-end px-[12px] relative size-full py-[0px]">
            <div className="content-stretch flex flex-col h-[56px] items-start relative shrink-0 w-full" data-name="Value Container">
              <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0 w-full">
                <div className="flex flex-col font-[var(--font-open-sans)] font-regular justify-center leading-[0] relative shrink-0 text-muted-foreground text-[12px] text-right whitespace-nowrap">
                  <p className="leading-[16px] text-[rgba(109,110,112,0.9)] font-[family-name:var(--font-open-sans)]">Est Annual Impact</p>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-end justify-center min-h-px min-w-px relative w-full">
                <div className="flex flex-col font-[family-name:var(--font-open-sans)] font-semibold justify-center leading-[0] relative shrink-0 text-secondary text-[24px] text-right whitespace-nowrap">
                  <p className="leading-[28px] text-[#2ca02c] text-[28px]">{data.savings.annualImpactRange}</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[4px] items-end relative shrink-0 w-full">
              <div className="content-stretch flex flex-col items-end relative shrink-0 w-full">
                <div className="flex flex-col font-[family-name:var(--font-open-sans)] font-normal justify-center leading-[0] relative shrink-0 text-muted-foreground text-[0px] text-right whitespace-nowrap">
                  <p>
                    <span className="font-[family-name:var(--font-open-sans)] font-normal leading-[18px] text-[12px]">Midpoint :</span>
                    <span className="font-[family-name:var(--font-open-sans)] font-normal leading-[18px] text-secondary text-[13px]">{` `}</span>
                    <span className="font-[family-name:var(--font-open-sans)] font-semibold leading-[18px] text-secondary text-[13px]">{data.savings.midpoint}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HighCostKpi({ data }: { data: OpportunityCardData }) {
  const hc = data.highCostProvider;
  return (
    <div className="content-stretch flex flex-col h-[132px] items-start min-h-[124px] relative shrink-0 w-[218px]" data-name="Container">
      <KpiHeader icon={<HighCostIcon />} label="High Cost" rightContent={<div className="content-stretch flex flex-col items-start p-[0px] relative shrink-0"><ProviderPopover profile={hc.profile} type="high" /></div>} />
      <div className="content-stretch flex flex-col h-[92px] items-end justify-start relative shrink-0 w-full" data-name="Avg Cost Container">
        <div className="content-stretch flex flex-col h-[56px] items-end relative shrink-0 w-full">
          <div className="content-stretch flex flex-col items-end relative shrink-0 w-full">
            <div className="flex flex-col font-[var(--font-open-sans)] font-regular justify-center leading-[0] relative shrink-0 text-muted-foreground text-[12px] text-right w-full">
              <p className="leading-[16px] whitespace-pre-wrap text-[rgba(109,110,112,0.7)] font-[family-name:var(--font-open-sans)]">Avg Cost/Case</p>
            </div>
          </div>
          <div className="content-stretch flex gap-[4px] h-[40px] items-center justify-end relative shrink-0 w-full">
            <div className="flex flex-col font-[family-name:var(--font-open-sans)] font-semibold justify-center leading-[0] relative shrink-0 text-destructive text-[24px] text-right whitespace-nowrap">
              <p className="leading-[28px] text-[28px]">{hc.avgCostPerCase}</p>
            </div>
          </div>
        </div>
        <div className="mt-[2px] w-full flex justify-end">
          <div className="content-stretch flex items-center justify-end relative shrink-0 w-full">
            <div className="content-stretch flex flex-col h-[16px] items-end relative shrink-0 w-[123px]">
              <div className="flex flex-col font-[family-name:var(--font-open-sans)] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-muted-foreground text-[0px] text-right w-full">
                <p className="whitespace-pre-wrap">
                  <span className="leading-[18px] text-[12px]">Cases/12mo:</span>
                  <span className="leading-[18px] text-[13px]">{` `}</span>
                  <span className="font-[family-name:var(--font-open-sans)] font-medium leading-[18px] text-foreground text-[14px]">{hc.caseVolume12mo}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto w-full flex justify-end">
          <div className="content-stretch flex gap-[8px] items-start justify-end relative shrink-0 w-full px-[0px] py-[5px]">
            <div className="flex flex-col font-[family-name:var(--font-open-sans)] font-normal justify-center leading-[0] relative shrink-0 text-muted-foreground text-[0px] text-right whitespace-nowrap">
              <p>
                <span className="font-[family-name:var(--font-open-sans)] font-normal leading-[16px] text-[12px]">Savings/Case: ~</span>
                <span className="font-[family-name:var(--font-open-sans)] font-normal leading-[16px] text-secondary text-[14px]">{` `}</span>
                <span className="font-[family-name:var(--font-open-sans)] font-bold leading-[16px] text-secondary text-[15px]">{hc.savingsPerCase}</span>
              </p>
            </div>
            <Tooltip.Provider delayDuration={200}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center px-[6px] relative rounded-[4px] shrink-0 cursor-help hover:bg-[#2CA02C]/20 transition-colors bg-[#2ca02c1a]">
                    <div className="content-stretch flex gap-[4px] h-full items-center relative shrink-0">
                      <div className="content-stretch flex flex-col items-center relative shrink-0">
                        <div className="flex flex-col font-[family-name:var(--font-open-sans)] font-semibold justify-center leading-[0] opacity-80 relative shrink-0 text-muted-foreground text-[11px] text-center whitespace-nowrap">
                          <p className="leading-[18px] px-[2px] py-[0px] font-bold text-[#333333e6]">{hc.riskAdjustedProbability}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-card p-2 rounded-[var(--radius-card)] shadow-lg border border-border max-w-[200px] z-[100] animate-in fade-in zoom-in duration-150" sideOffset={5} align="end">
                    <p className="text-[11px] leading-tight text-foreground font-[family-name:var(--font-open-sans)]">{hc.probabilityTooltip}</p>
                    <Tooltip.Arrow className="fill-card" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}

function LowCostKpi({ data }: { data: OpportunityCardData }) {
  const lc = data.lowCostProvider;
  return (
    <div className="content-stretch flex flex-col h-[132px] items-start min-h-[124px] pl-[5px] relative shrink-0 w-[218px] min-w-[218px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f3f6] border-l border-solid inset-0 pointer-events-none" />
      <KpiHeader icon={<LowCostIcon />} label="Low Cost" rightContent={<div className="content-stretch flex flex-col items-start p-[0px] relative shrink-0"><ProviderPopover profile={lc.profile} type="low" /></div>} />
      <div className="content-stretch flex flex-[1_0_0] flex-col h-[92px] items-start justify-start relative shrink-0 w-full" data-name="Avg Cost Container">
        <div className="content-stretch flex flex-col h-[56px] items-end relative shrink-0 w-full">
          <div className="content-stretch flex flex-col items-end relative shrink-0 w-full">
            <div className="flex flex-col font-[var(--font-open-sans)] font-regular justify-center leading-[0] relative shrink-0 text-muted-foreground text-[12px] text-right w-full">
              <p className="leading-[16px] whitespace-pre-wrap text-[rgba(109,110,112,0.7)]">Avg Cost/Case</p>
            </div>
          </div>
          <div className="content-stretch flex gap-[4px] h-[40px] items-center justify-end relative shrink-0 w-full">
            <div className="flex flex-col font-[family-name:var(--font-open-sans)] font-semibold justify-center leading-[0] relative shrink-0 text-foreground text-[24px] text-right whitespace-nowrap">
              <p className="leading-[28px] text-[28px]">{lc.avgCostPerCase}</p>
            </div>
          </div>
        </div>
        <div className="mt-[2px] flex flex-col font-[family-name:var(--font-open-sans)] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-muted-foreground text-[0px] text-right w-full">
          <p className="whitespace-pre-wrap">
            <span className="font-[family-name:var(--font-open-sans)] leading-[18px] text-[12px]">Cases/12mo:</span>
            <span className="font-[family-name:var(--font-open-sans)] leading-[18px] text-foreground text-[13px]">{` `}</span>
            <span className="font-[family-name:var(--font-open-sans)] font-medium leading-[18px] text-foreground text-[14px]">{lc.caseVolume12mo}</span>
          </p>
        </div>
        <div className="mt-auto">
          <div className="content-stretch flex flex-col items-end shrink-0 w-full" data-name="Container" />
        </div>
      </div>
    </div>
  );
}

function SupplyDriversKpi({ data }: { data: OpportunityCardData }) {
  return (
    <div className="content-stretch flex flex-col h-[132px] items-start min-h-[124px] pl-[5px] relative shrink-0 w-[218px]" data-name="kpi - utilization">
      <div aria-hidden="true" className="absolute border-border border-l border-solid inset-0 pointer-events-none" />
      <KpiHeader icon={<SuppliesIcon />} label="Supplies" />
      <div className="content-stretch flex flex-col gap-[6px] h-[93px] items-end relative shrink-0 w-full" data-name="Key Drivers Container">
        <div className="flex flex-col font-[var(--font-open-sans)] font-regular justify-center leading-[0] relative shrink-0 text-muted-foreground text-[12px] text-right w-full">
          <p className="leading-[16px] whitespace-pre-wrap text-[rgba(109,110,112,0.7)] font-[family-name:var(--font-open-sans)]">Key Cost Drivers</p>
        </div>
        <div className="content-stretch flex flex-col gap-[6px] h-auto items-start relative shrink-0 w-full pt-[4px] pb-[4px] pl-[6px]" data-name="Key Drivers List Container">
          {data.keyDrivers.map((driver) => (
            <div key={driver} className="flex items-center gap-2 w-full">
              <div className="flex items-center justify-center size-[6px] shrink-0">
                <div className="size-1 bg-[#6d6e70] rounded-full opacity-60" />
              </div>
              <div className="content-stretch flex h-[20px] items-start justify-start relative shrink-0 flex-1">
                <p className="flex-[1_0_0] font-[family-name:var(--font-open-sans)] font-semibold leading-[20px] min-h-px min-w-px relative text-foreground text-left whitespace-pre-wrap text-[13px]">{driver}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatternBulletsKpi({ data }: { data: OpportunityCardData }) {
  return (
    <div className="content-stretch flex flex-col h-[132px] items-start min-h-[124px] px-[8px] relative shrink-0 w-[312px] min-[1440px]:flex-1 min-[1440px]:w-auto overflow-hidden" data-name="wrapper">
      <div aria-hidden="true" className="absolute border-border border-l border-solid inset-0 pointer-events-none" />
      <div className="min-[1440px]:hidden flex flex-col gap-[4px] w-full pl-[4px] overflow-hidden h-full">
        <div className="flex flex-col gap-[2px]">
          <KpiHeader icon={<HighCostIcon />} label="Provider Pattern" />
          <ul className="flex flex-col gap-[3px] pl-[4px]">
            {data.providerPattern.bulletsShort.map((b, i) => (
              <li key={i} className="flex items-start gap-[4px]">
                <span className="mt-[5px] size-[3px] rounded-full shrink-0 bg-destructive opacity-70" />
                <span className="font-[family-name:var(--font-open-sans)] text-[length:var(--text-xs)] text-muted-foreground leading-[14px] line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-[2px]">
          <KpiHeader icon={<LowCostIcon />} label="Peer Pattern" />
          <ul className="flex flex-col gap-[3px] pl-[4px]">
            {data.peerPattern.bulletsShort.map((b, i) => (
              <li key={i} className="flex items-start gap-[4px]">
                <span className="mt-[5px] size-[3px] rounded-full shrink-0 bg-secondary opacity-70" />
                <span className="font-[family-name:var(--font-open-sans)] text-[length:var(--text-xs)] text-muted-foreground leading-[14px] line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="hidden min-[1440px]:flex flex-row gap-[12px] w-full overflow-hidden h-full">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <KpiHeader icon={<HighCostIcon />} label="Provider Pattern" />
          <ul className="flex flex-col gap-[3px] pl-[4px] pt-[2px]">
            {data.providerPattern.bulletsFull.map((b, i) => (
              <li key={i} className="flex items-start gap-[4px]">
                <span className="mt-[5px] size-[3px] rounded-full shrink-0 bg-destructive opacity-70" />
                <span className="font-[family-name:var(--font-open-sans)] text-[11px] text-muted-foreground leading-[14px] line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <KpiHeader icon={<LowCostIcon />} label="Peer Pattern" />
          <ul className="flex flex-col gap-[3px] pl-[4px] pt-[2px]">
            {data.peerPattern.bulletsFull.map((b, i) => (
              <li key={i} className="flex items-start gap-[4px]">
                <span className="mt-[5px] size-[3px] rounded-full shrink-0 bg-secondary opacity-70" />
                <span className="font-[family-name:var(--font-open-sans)] text-[11px] text-muted-foreground leading-[14px] line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ActionBar({ isExpanded, onToggle, onDismiss, onMoveToActive }: { isExpanded: boolean; onToggle: () => void; onDismiss?: () => void; onMoveToActive?: () => void }) {
  return (
    <div className="relative shrink-0 w-full pt-[4px]" data-name="action buttons container">
      <div className="border-t border-border absolute top-0 left-0 right-0 pointer-events-none" aria-hidden="true" />
      <div className="flex gap-[8px] items-center justify-between px-[0px] py-[2px]">
        <div className="content-stretch flex flex-[1_0_0] h-[26px] items-center min-h-px min-w-px relative" data-name="accordion">
          <button onClick={onToggle} className="flex items-center gap-2 text-primary font-bold text-sm px-3 py-1.5 rounded-[var(--radius-button)] hover:underline transition-all font-normal cursor-pointer">
            {isExpanded ? (<><ChevronUp className="w-4 h-4" /><span className="font-[var(--font-open-sans)]">Show Less</span></>) : (<><ChevronDown className="w-4 h-4" /><span className="font-[family-name:var(--font-open-sans)] text-[15px]">Show More</span></>)}
          </button>
        </div>
        <div className="content-stretch flex items-start relative shrink-0">
          <div className="content-stretch flex gap-[24px] items-center relative shrink-0 p-[0px]" data-name="card action buttons">
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
              <div onClick={onDismiss} className="content-stretch flex gap-[6px] h-[28px] items-center justify-center px-[12px] relative rounded-[var(--radius-button)] shrink-0 cursor-pointer bg-[#F0F3F6] hover:bg-[#E5E9EF] transition-colors" data-name="Button tertiary ghost">
                <div className="relative shrink-0 size-6 flex items-center justify-center rounded-[var(--radius-button)] bg-transparent text-muted-foreground">
                  <svg className="block size-3.5" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 14 14">
                    <path d={svgPaths.p7379200} fill="currentColor" id="Vector" />
                  </svg>
                </div>
                <div className="flex flex-col font-[var(--font-open-sans)] font-normal justify-center leading-[0] max-h-[20px] relative shrink-0 text-muted-foreground text-[14px] text-center whitespace-nowrap">
                  <p className="leading-[14px] font-[family-name:var(--font-open-sans)] text-[15px]">Dismiss</p>
                </div>
              </div>
            </div>
            <div onClick={onMoveToActive} className="bg-secondary content-stretch flex gap-[8px] h-[28px] items-center justify-center px-[20px] relative rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:bg-secondary/90 transition-colors" data-name="CTA Button Flag">
              <div className="relative shrink-0 size-4 flex items-center justify-center text-white">
                <svg className="block size-3.5" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 14 14">
                  <path d={svgPaths.pf20af00} fill="currentColor" id="Vector" />
                </svg>
              </div>
              <div className="flex flex-col font-[var(--font-open-sans)] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
                <p className="leading-[20px] font-[family-name:var(--font-open-sans)] text-[15px]">Move to Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OpportunityTileSupply({ data, isExpanded, onToggle, onDismiss, onMoveToActive }: { data: OpportunityCardData; isExpanded: boolean; onToggle: () => void; onDismiss?: () => void; onMoveToActive?: () => void; }) {
  return (
    <div className="content-stretch flex flex-col items-start px-[24px] py-[8px] relative size-full" data-name="opportunity tile - supply -2026">
      <HeaderSection data={data} />
      <div className="content-start flex items-start max-w-full min-h-[132px] py-[10px] relative shrink-0 w-full" data-name="tile kpis">
        <div aria-hidden="true" className="absolute border-border border-solid border-t border-b-[1px] inset-0 pointer-events-none p-[0px]" />
        <div className="content-stretch flex gap-[12px] items-stretch relative w-full flex-1" data-name="kpis">
          <SavingsKpi data={data} />
          <HighCostKpi data={data} />
          <LowCostKpi data={data} />
          <SupplyDriversKpi data={data} />
          <PatternBulletsKpi data={data} />
        </div>
      </div>
      <ActionBar isExpanded={isExpanded} onToggle={onToggle} onDismiss={onDismiss} onMoveToActive={onMoveToActive} />
    </div>
  );
}
