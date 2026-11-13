"use client";

/**
 * Moderna Library — Tabs / Tab.
 *
 * Figma: "Tab menu." / "Single tab. State: Default, Hover, Selected (tinted
 * with a 2px primary underline)."
 *
 * Implemented with the WAI-ARIA tab pattern, so arrow keys move between tabs
 * and only the selected one is in the tab order.
 */

export interface TabDefinition<Id extends string> {
  id: Id;
  label: string;
}

interface TabsProps<Id extends string> {
  tabs: readonly TabDefinition<Id>[];
  selected: Id;
  onSelect: (id: Id) => void;
  /** Labels the tablist for screen readers, e.g. "How to add your work". */
  label: string;
  className?: string;
}

export function Tabs<Id extends string>({
  tabs,
  selected,
  onSelect,
  label,
  className = "",
}: TabsProps<Id>) {
  function handleKeyDown(event: React.KeyboardEvent) {
    const offset =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (offset === 0) return;

    event.preventDefault();
    const current = tabs.findIndex((tab) => tab.id === selected);
    // Wraps around at both ends, which is what the ARIA pattern expects.
    const next = (current + offset + tabs.length) % tabs.length;
    onSelect(tabs[next].id);
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={`flex items-start gap-[4px] ${className}`}
    >
      {tabs.map((tab) => {
        const isSelected = tab.id === selected;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isSelected}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            className={[
              "type-utility-1-medium flex items-center whitespace-nowrap",
              "rounded-t-[4px] px-[12px] py-[10px]",
              isSelected
                ? "border-b-2 border-primary-default bg-primary-subtle text-primary-default"
                : "text-text-secondary hover:bg-surface-subtle",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  /** Must match the id of the tab that controls it. */
  tabId: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ tabId, children, className = "" }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  );
}
