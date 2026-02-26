import svgPaths from "./svg-ebu6zzmosr";
import * as Popover from "@radix-ui/react-popover";

interface PopOverProps {
  procedure?: string;
  procId?: string;
  setting?: string;
  cpts?: string[];
  drgs?: string[];
  onClose?: () => void;
}

function Frame2({ procedure }: { procedure?: string }) {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-[146px]">
      <p className="font-[family-name:var(--font-open-sans)] font-semibold leading-[18px] relative shrink-0 text-foreground text-[12px]">
        {procedure || "Procedure Info"}
      </p>
    </div>
  );
}

function Close({ onClick }: { onClick?: () => void }) {
  return (
    <Popover.Close asChild>
      <button 
        onClick={onClick}
        className="block cursor-pointer relative shrink-0 size-6 hover:bg-muted rounded-[var(--radius-button)] transition-colors flex items-center justify-center text-muted-foreground" 
        data-name="close"
      >
        <svg className="block size-3.5" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 14 14">
          <path d={svgPaths.p51a5f00} fill="currentColor" id="Vector_2" />
        </svg>
      </button>
    </Popover.Close>
  );
}

function Frame1({ procedure, onClose }: { procedure?: string; onClose?: () => void }) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[8px] relative w-full">
          <Frame2 procedure={procedure} />
          <Close onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0 w-[60px]">
      <p className="font-[family-name:var(--font-open-sans)] font-semibold leading-[normal] relative shrink-0 text-foreground text-[11px]">
        Proc ID
      </p>
    </div>
  );
}

function Frame11({ procId }: { procId?: string }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col font-[family-name:var(--font-open-sans)] font-normal gap-[2px] items-start justify-center leading-[normal] min-h-px min-w-px relative text-muted-foreground text-[12px]">
      <p className="relative shrink-0">
        {procId}
      </p>
    </div>
  );
}

function Frame6({ procId }: { procId?: string }) {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame3 />
      <Frame11 procId={procId} />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0 w-[60px]">
      <p className="font-[family-name:var(--font-open-sans)] font-semibold leading-[normal] relative shrink-0 text-foreground text-[11px]">
        Setting
      </p>
    </div>
  );
}

function Frame5({ setting }: { setting?: string }) {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame4 />
      <p className="font-[family-name:var(--font-open-sans)] font-normal leading-[normal] relative shrink-0 text-muted-foreground text-[12px]">
        {setting}
      </p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0 w-[60px]">
      <p className="font-[family-name:var(--font-open-sans)] font-semibold leading-[18px] relative shrink-0 text-foreground text-[12px]">
        CPTs
      </p>
    </div>
  );
}

function Frame7({ cpts }: { cpts?: string[] }) {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame8 />
      <p className="flex-[1_0_0] font-[family-name:var(--font-open-sans)] font-normal leading-[normal] min-h-px min-w-px relative text-muted-foreground text-[12px] whitespace-pre-wrap">
        {cpts?.join(", ")}
      </p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0 w-[60px]">
      <p className="font-[family-name:var(--font-open-sans)] font-semibold leading-[18px] relative shrink-0 text-foreground text-[12px]">
        DRGs
      </p>
    </div>
  );
}

function Frame12({ drgs }: { drgs?: string[] }) {
  return (
    <div className="flex-[1_0_0] font-[family-name:var(--font-open-sans)] font-normal gap-[8px] grid grid-cols-[repeat(1,_minmax(0,_1fr))] leading-[normal] min-h-[18px] min-w-px relative self-stretch text-muted-foreground text-[12px] whitespace-pre-wrap">
      {drgs && drgs.length > 0 ? (
        drgs.map((drg, idx) => (
          <p key={idx} className="relative self-start shrink-0">
            {drg}
          </p>
        ))
      ) : (
        <p className="relative self-start shrink-0 italic opacity-50">
          for inpatient only
        </p>
      )}
    </div>
  );
}

function Frame9({ drgs }: { drgs?: string[] }) {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame10 />
      <Frame12 drgs={drgs} />
    </div>
  );
}

function Content({ procId, setting, cpts, drgs }: PopOverProps) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[8px] relative w-full">
        <Frame6 procId={procId} />
        <Frame5 setting={setting} />
        <Frame7 cpts={cpts} />
        <Frame9 drgs={drgs} />
      </div>
    </div>
  );
}

export default function PopOverCpTmultiple({ 
  procedure = "TOTAL KNEE REPLACEMENT",
  procId = "OPP-1070003440-OUT-2412b776",
  setting = "Outpatient",
  cpts = ["27447", "36415", "97116", "C1713", "97165"],
  drgs = [],
  onClose
}: PopOverProps) {
  return (
    <div className="bg-card content-stretch flex flex-col gap-[4px] items-start overflow-clip px-[4px] py-[8px] relative rounded-[var(--radius-card)] shadow-xl border border-border w-[300px]" data-name="pop over-CPTmultiple">
      <Frame1 procedure={procedure} onClose={onClose} />
      <div className="h-px relative shrink-0 w-full bg-border my-[4px]" data-name="divider" />
      <Content procId={procId} setting={setting} cpts={cpts} drgs={drgs} />
      <div className="w-full border-t border-border/30 m-[0px]" data-name="dev-metadata">
        <div className="text-[10px] font-mono text-muted-foreground/50 flex justify-start uppercase tracking-tighter text-[rgba(109,110,112,0.6)] px-[8px] py-[6px] text-left">
          <span className="text-[rgba(109,110,112,0.7)] text-[10px] text-left font-[family-name:var(--font-open-sans)] font-normal">Opportunity ID: {procId}</span>
        </div>
      </div>
    </div>
  );
}
