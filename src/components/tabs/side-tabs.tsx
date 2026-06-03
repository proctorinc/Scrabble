"use client";

import { IconBook2, IconMessages, IconMoneybag } from "@tabler/icons-react";
import { Logs } from "@/components/game/logs";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/context/game-context";

export function SideTabs() {
  const {
    activeTab,
    setActiveTab,
    game,
    tileCounts,
    dictionary,
    defineSearch,
    searchDictionary,
  } = useGame();

  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      <div className="paper-panel flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[30px] border border-panel p-3">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log">
              <IconMessages className="h-4 w-4" />
              <span>Log</span>
            </TabsTrigger>
            <TabsTrigger value="tiles">
              <IconMoneybag className="h-4 w-4" />
              <span>Tiles</span>
            </TabsTrigger>
            <TabsTrigger value="define">
              <IconBook2 className="h-4 w-4" />
              <span>Define</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="min-h-0 flex-1 overflow-hidden">
            <Logs />
          </TabsContent>

          <TabsContent value="tiles" className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-3 p-1">
              <h3 className="text-center text-lg font-semibold text-display">
                Tiles Left: {game.bag.length}
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {Object.keys(tileCounts)
                  .sort()
                  .map((letter) => (
                    <div
                      key={letter}
                      className="rounded-2xl border border-panel-subtle bg-count-chip p-2 text-center text-sm font-semibold shadow-[var(--shadow-inset-soft)]"
                    >
                      {letter} {tileCounts[letter]}
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="define" className="min-h-0 flex-1">
            <div className="flex h-full min-h-0 flex-col p-1">
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-4">
                {!dictionary.ready ? (
                  <p className="text-sm text-muted-foreground">
                    Loading dictionary...
                  </p>
                ) : defineSearch.query.trim().length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Search the dictionary.
                  </p>
                ) : defineSearch.matches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No words found.
                  </p>
                ) : (
                  defineSearch.matches.map((word) => (
                    <div
                      key={word}
                      className="rounded-2xl border border-panel-subtle bg-surface-soft px-3 py-2 text-sm shadow-[var(--shadow-inset-soft)]"
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
