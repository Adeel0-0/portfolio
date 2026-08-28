"use client";

import { Flag, Radio, Trophy, User, Wrench, type LucideIcon } from "lucide-react";

import { useActiveSection } from "@/components/providers/scroll-provider";
import { usePreloaderDone } from "@/lib/hooks/use-preloader-done";
import { SECTIONS, type SectionIcon } from "@/lib/sections";
import { AnimatedTabBar, type TabItem } from "./animated-tab-bar";

/**
 * The bottom dock.
 *
 * Mounts as a sibling of #site-shell, never inside it: globals.css transforms
 * that wrapper while the preloader hands off, and a transformed ancestor is a
 * containing block for position:fixed. Inside, this would pin itself to the
 * bottom of the *document* for ~1.1s and then snap into place in full view.
 */

// lib/sections.ts stays free of JSX so server components can import it cheaply,
// which is why it carries icon keys and the mapping lands here.
const ICONS: Record<SectionIcon, LucideIcon> = {
  flag: Flag,
  user: User,
  trophy: Trophy,
  wrench: Wrench,
  radio: Radio,
};

const items: TabItem[] = SECTIONS.map((section) => {
  const Icon = ICONS[section.icon];
  return {
    id: section.id,
    label: section.label,
    icon: <Icon className="icon" aria-hidden="true" />,
  };
});

export function NavDock() {
  const { activeId, scrollTo } = useActiveSection();
  const ready = usePreloaderDone();

  const activeIndex = SECTIONS.findIndex((section) => section.id === activeId);

  return (
    <div
      // Rendered always, hidden until the launch finishes — never conditionally
      // mounted, so the server and first client render agree.
      //
      // `invisible` rather than `opacity-0`: an element at zero opacity is
      // still focusable and still announced, so a keyboard user tabbing during
      // the hand-off would land on buttons they cannot see. visibility:hidden
      // takes it out of the tab order and the accessibility tree together.
      data-ready={ready ? "true" : "false"}
      className="invisible fixed inset-x-0 bottom-0 z-dock flex translate-y-3 justify-center opacity-0 transition-[opacity,transform] duration-500 ease-out data-[ready=true]:visible data-[ready=true]:translate-y-0 data-[ready=true]:opacity-100"
      style={{
        // iOS Safari's home indicator sits over bottom: 0.
        paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
      }}
    >
      <AnimatedTabBar
        items={items}
        activeIndex={activeIndex === -1 ? 0 : activeIndex}
        onSelect={(index) => scrollTo(SECTIONS[index].id)}
      />
    </div>
  );
}
