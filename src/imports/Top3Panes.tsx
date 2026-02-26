import svgPaths from "./svg-u82qsqsaz7";

export type TabKey = 'new' | 'active' | 'dismissed';

interface Top3PanesProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts: { new: number; active: number; dismissed: number };
}

function IconFontAwesomeFreeSolidFFilter() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon/Font Awesome Free/Solid/F/filter">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon/Font Awesome Free/Solid/F/filter">
          <path d={svgPaths.p306ef800} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonHideFilters() {
  return (
    <div className="bg-[var(--brand-purple)] content-stretch flex gap-[6px] items-center px-[12px] py-[6px] relative rounded-[var(--radius-button)] self-stretch shrink-0 cursor-pointer" data-name="Button/Hide Filters">
      <IconFontAwesomeFreeSolidFFilter />
      <p className="font-[family-name:var(--font-open-sans)] leading-[14px] relative shrink-0 text-[13px] text-white">
        Filters
      </p>
    </div>
  );
}

function IconFontAwesomeFreeSolidFFolder() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon/Font Awesome Free/Solid/F/folder">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon/Font Awesome Free/Solid/F/folder">
          <path d={svgPaths.p3eb3d200} fill="var(--fill-0, #6D6E70)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ClearIcon() {
  return (
    <div className="h-[12px] relative shrink-0 w-[11.478px]" data-name="clear">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.4783 12">
        <g>
          <path d={svgPaths.p3350cbf0} fill="var(--fill-0, #6D6E70)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function FilterChip({ label, icon, count }: { label: string; icon?: React.ReactNode; count?: number }) {
  return (
    <div className="bg-[rgba(222,222,222,0.5)] content-stretch flex gap-[4px] h-[26px] items-center justify-center px-[8px] py-[6px] relative rounded-[var(--radius-button)] shrink-0">
      {count !== undefined && (
        <div className="bg-[#afe3fb] content-stretch flex flex-col items-center justify-center px-[4px] relative rounded-[var(--radius-button)] shrink-0">
          <p className="font-[family-name:var(--font-open-sans)] leading-[normal] overflow-hidden relative shrink-0 text-foreground text-[12px] text-center text-ellipsis">
            {count}
          </p>
        </div>
      )}
      {icon}
      <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
        <span className="font-[family-name:var(--font-open-sans)] leading-[14px] relative shrink-0 text-muted-foreground text-[13px] whitespace-nowrap">
          {label}
        </span>
        <ClearIcon />
      </div>
    </div>
  );
}

function FilterButtonsSelectedChips() {
  return (
    <div className="content-stretch flex gap-[12px] h-[26px] items-center relative shrink-0" data-name="Filter buttons-Selected chips">
      <ButtonHideFilters />
      <div className="content-stretch flex gap-[16px] h-full items-center relative shrink-0">
        <FilterChip label="Supplies" icon={<IconFontAwesomeFreeSolidFFolder />} />
        <FilterChip label="Orthopedics" />
        <FilterChip label="Departments" count={2} />
        <FilterChip label="Locations" count={2} />
      </div>
    </div>
  );
}

function IconFontAwesomeFreeSolidCCheck() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon/Font Awesome Free/Solid/C/check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon/Font Awesome Free/Solid/C/check">
          <path d={svgPaths.p17527b00} fill="var(--fill-0, #00A859)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function RefreshDate() {
  return (
    <div className="content-stretch flex h-[35px] items-center justify-end relative shrink-0" data-name="refresh date">
      <div className="content-stretch flex gap-[8px] h-full items-center justify-end py-[2px] relative shrink-0">
        <IconFontAwesomeFreeSolidCCheck />
        <span className="font-[family-name:var(--font-open-sans)] leading-[13px] relative shrink-0 text-foreground text-[13px] whitespace-nowrap">
          Data refreshed 11:00 PM, 07/15/2025
        </span>
      </div>
    </div>
  );
}

function TopButtonsContainer() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-between relative shrink-0 w-full" data-name="top buttons container">
      <FilterButtonsSelectedChips />
      <RefreshDate />
    </div>
  );
}

function HeaderContainer() {
  return (
    <div className="content-stretch flex gap-[10px] h-[40px] items-center relative shrink-0 w-full" data-name="header container">
      <span className="font-[family-name:var(--font-archivo)] font-[var(--font-weight-bold)] leading-[36.75px] relative shrink-0 text-foreground text-[20px] whitespace-nowrap">
        High-Cost, High-Variation Opportunities
      </span>
    </div>
  );
}

function IconFontAwesomeFreeSolidCChevronDown() {
  return (
    <div className="relative shrink-0 size-[12px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g>
          <path d={svgPaths.p37e13500} fill="var(--fill-0, #6D6E70)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SortDropdown() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 z-[1]" data-name="Sort Container">
      <span className="font-[family-name:var(--font-open-sans)] leading-[normal] relative shrink-0 text-foreground text-[13px]">
        Sort by:
      </span>
      <div className="bg-card content-stretch flex flex-col gap-[2px] items-start relative shrink-0">
        <div className="h-[28px] relative rounded-[var(--radius-button)] shrink-0 w-full">
          <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center pl-[4px] relative size-full">
              <div className="content-stretch flex gap-[6px] items-center pl-[4px] pr-[8px] relative shrink-0">
                <span className="font-[family-name:var(--font-open-sans)] leading-[normal] relative shrink-0 text-foreground text-[13px]">
                  Savings upper bound
                </span>
              </div>
              <div className="content-stretch flex h-full items-center justify-between px-[8px] relative shrink-0 w-[28px]">
                <div aria-hidden="true" className="absolute border-border border-l border-solid inset-0 pointer-events-none" />
                <IconFontAwesomeFreeSolidCChevronDown />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniTabs({ activeTab, onTabChange, counts }: { activeTab: TabKey; onTabChange: (tab: TabKey) => void; counts: { new: number; active: number; dismissed: number } }) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'new', label: 'New' },
    { key: 'active', label: 'Active' },
    { key: 'dismissed', label: 'Dismissed' },
  ];

  return (
    <div className="content-stretch flex gap-px h-[28px] items-center relative shrink-0 z-[2]" data-name="mini tabs">
      {tabs.map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`content-stretch flex gap-[8px] h-[28px] items-center justify-center px-[12px] py-[8px] relative rounded-[var(--radius-button)] shrink-0 cursor-pointer transition-colors outline-none ${
              isActive
                ? 'bg-[#dedede]'
                : 'hover:bg-[#f0f0f0]'
            }`}
          >
            <span className={`font-[family-name:var(--font-open-sans)] leading-[14px] relative shrink-0 text-[13px] whitespace-nowrap ${
              isActive ? 'text-foreground font-[var(--font-weight-semibold)]' : 'text-muted-foreground'
            }`}>
              {label} ({counts[key]})
            </span>
          </button>
        );
      })}
    </div>
  );
}

function OpportunitiesCardFiltersAndButtonsContainer({ activeTab, onTabChange, counts }: { activeTab: TabKey; onTabChange: (tab: TabKey) => void; counts: { new: number; active: number; dismissed: number } }) {
  return (
    <div className="content-stretch flex h-[40px] isolate items-center justify-between relative shrink-0 w-full" data-name="OpportunitiesCard-filters and buttons-container">
      <div className="content-stretch flex flex-[1_0_0] isolate items-center justify-between min-h-px min-w-px relative z-[1]">
        <MiniTabs activeTab={activeTab} onTabChange={onTabChange} counts={counts} />
        <SortDropdown />
      </div>
    </div>
  );
}

export default function Top3Panes({ activeTab, onTabChange, counts }: Top3PanesProps) {
  return (
    <div className="content-stretch flex flex-col items-start relative w-full" data-name="top 3 panes">
      <TopButtonsContainer />
      <HeaderContainer />
      <OpportunitiesCardFiltersAndButtonsContainer activeTab={activeTab} onTabChange={onTabChange} counts={counts} />
    </div>
  );
}
