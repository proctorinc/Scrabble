"use client";

import { useState } from "react";
import {
  IconArrowLeft,
  IconBook2,
  IconFlag3,
  IconPlayerTrackNext,
  IconReceipt2,
} from "@tabler/icons-react";
import { ActionConfirmationDialog } from "@/components/action/action-confirmation-dialog";
import { Logs } from "@/components/game/logs";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useGame } from "@/context/game-context";
import { cn } from "@/lib/utils";

type MobileMenuView = "menu" | "dictionary" | "history";
type MobileMenuConfirmAction = "skip" | "forfeit" | null;

export function MobileMenuDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    defineSearch,
    dictionary,
    forfeitGame,
    isInteractionLocked,
    passCurrentTurn,
    searchDictionary,
  } = useGame();
  const [view, setView] = useState<MobileMenuView>("menu");
  const [confirmAction, setConfirmAction] =
    useState<MobileMenuConfirmAction>(null);

  function closeDrawer() {
    setView("menu");
    setConfirmAction(null);
    onClose();
  }

  const menuItems = [
    {
      key: "skip",
      label: "Skip Turn",
      icon: IconPlayerTrackNext,
      disabled: isInteractionLocked,
      onClick: () => setConfirmAction("skip"),
    },
    {
      key: "dictionary",
      label: "View Dictionary",
      icon: IconBook2,
      disabled: false,
      onClick: () => setView("dictionary"),
    },
    {
      key: "history",
      label: "View Turn History",
      icon: IconReceipt2,
      disabled: false,
      onClick: () => setView("history"),
    },
    {
      key: "forfeit",
      label: "Forfeit Game",
      icon: IconFlag3,
      disabled: isInteractionLocked,
      onClick: () => setConfirmAction("forfeit"),
      destructive: true,
    },
  ];

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          if (confirmAction) {
            setConfirmAction(null);
            return;
          }
          closeDrawer();
        }
      }}
    >
      <DrawerContent className="sm:hidden pb-28 overflow-y-scroll">
        <DrawerHeader>
          <div className="flex items-center gap-2">
            {view !== "menu" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setView("menu")}
                aria-label="Back to menu"
                className="h-10 w-10 rounded-full"
              >
                <IconArrowLeft className="h-5 w-5" />
              </Button>
            ) : null}
            <div className="min-w-0">
              <DrawerTitle>
                {view === "menu"
                  ? "Game Menu"
                  : view === "dictionary"
                    ? "Dictionary"
                    : "Turn History"}
              </DrawerTitle>
              <DrawerDescription>
                {view === "menu"
                  ? "Manage the current turn or open the game references."
                  : view === "dictionary"
                    ? "Search the bundled word list."
                    : "Review the most recent turns."}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>
        {view === "menu" ? (
          <div className="grid gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.key}
                  type="button"
                  variant={item.destructive ? "outline" : "secondary"}
                  disabled={item.disabled}
                  onClick={item.onClick}
                  className={cn(
                    "h-auto justify-start gap-3 rounded-[22px] px-4 py-4 text-left text-base",
                    item.destructive &&
                      "border-error/60 text-error-foreground hover:bg-error-soft",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        ) : null}
        {view === "dictionary" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-[22px] border border-panel-subtle bg-surface-soft p-3 shadow-[var(--shadow-inset-soft)]">
              {!dictionary.ready ? (
                <p className="text-sm text-muted-foreground">
                  Loading dictionary...
                </p>
              ) : defineSearch.query.trim().length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Search the bundled dictionary.
                </p>
              ) : defineSearch.matches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No words found.</p>
              ) : (
                defineSearch.matches.map((word) => (
                  <div
                    key={word}
                    className="rounded-2xl border border-panel-subtle bg-surface-chip px-3 py-2 text-sm shadow-[var(--shadow-inset-soft)]"
                  >
                    {word}
                  </div>
                ))
              )}
            </div>
            <Input
              type="text"
              placeholder="Search dictionary..."
              value={defineSearch.query}
              onChange={(event) => searchDictionary(event.target.value)}
            />
          </div>
        ) : null}
        {view === "history" ? (
          <div className="min-h-0 flex-1 overflow-y-auto rounded-[22px] border border-panel-subtle bg-surface-soft shadow-[var(--shadow-inset-soft)]">
            <Logs />
          </div>
        ) : null}
      </DrawerContent>
      <ActionConfirmationDialog
        open={confirmAction === "skip"}
        title="Skip this turn?"
        description="You will pass without scoring and hand the game to the next player."
        confirmLabel="Skip Turn"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          passCurrentTurn();
          closeDrawer();
        }}
      />
      <ActionConfirmationDialog
        open={confirmAction === "forfeit"}
        title="Forfeit this game?"
        description="This ends the match immediately and awards the win to the other player."
        confirmLabel="Forfeit Game"
        confirmVariant="outline"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          forfeitGame();
          closeDrawer();
        }}
      />
    </Drawer>
  );
}
