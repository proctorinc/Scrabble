import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { IconBook2, IconMessages, IconMoneybag } from "@tabler/icons-react";
import Logs from "../game_logs/Logs";
import useGame from "../../hooks/useGame";
import { useMemo } from "react";

const TabMenu = () => {
  const { state } = useGame();

  const tileCountMap = useMemo(() => {
    const tileMap = new Map<string, number>();

    state.tile_bag.tiles.forEach((tile) => {
      const count = tileMap.get(tile.letter);
      if (count !== undefined) {
        tileMap.set(tile.letter, count + 1);
      } else {
        tileMap.set(tile.letter, 1);
      }
    });

    return tileMap;
  }, [state.tile_bag]);

  return (
    <div className="flex h-3/4 w-full">
      <TabGroup className="flex flex-col w-full rounded-lg bg-gray-100">
        <TabList className="flex justify-center gap-2 py-3 text-sm">
          <Tab className="data-[selected]:bg-gray-200 data-[selected]:shadow-inner flex items-center gap-1 rounded-lg px-3 py-1">
            <IconMessages className="h-6" />
            <span>Log</span>
          </Tab>
          <Tab className="data-[selected]:bg-gray-200 data-[selected]:shadow-inner flex items-center gap-1 rounded-lg px-3 py-1">
            <IconMoneybag className="h-6" />
            <span>Tiles</span>
          </Tab>
          <Tab className="data-[selected]:bg-gray-200 data-[selected]:shadow-inner flex items-center gap-1 rounded-lg px-3 py-1">
            <IconBook2 className="h-6" />
            <span>Define</span>
          </Tab>
        </TabList>
        <TabPanels className="h-screen overflow-y-scroll">
          <TabPanel>
            <Logs />
          </TabPanel>
          <TabPanel>
            <div className="flex flex-col p-3 gap-3">
              <h3 className="text-center">
                Tiles Left: {state.tile_bag.tiles.length}
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {Array.from(tileCountMap.keys())
                  .sort()
                  .map((letter) => {
                    return (
                      <div
                        key={`letter-count-${letter}`}
                        className="rounded-lg text-center bg-gray-200 w-full p-2 shadow-inner"
                      >
                        {letter} {tileCountMap.get(letter)}
                      </div>
                    );
                  })}
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="p-3 flex flex-col flex-grow">
              <div className="flex flex-col flex-grow h-full overflow-y-scroll">
                Testing
              </div>
              <div className="border border-gray-300 bg-white rounded-lg">
                <input
                  className="p-2 rounded-lg w-full"
                  type="text"
                  placeholder="Search dictionary..."
                />
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default TabMenu;
