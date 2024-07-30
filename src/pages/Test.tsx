import MobileActionBar from "../components/action/MobileActionBar";
import ActionBar from "../components/action/ActionBar";
import TitleBar from "../components/title/TitleBar";
import MobileTitleBar from "../components/title/MobileTitleBar";

const Test = () => {
  return (
    <div className="flex h-screen overflow-clip">
      <div id="left-sidebar" className="flex flex-grow"></div>
      <div className="flex flex-col w-full sm:max-w-2xl">
        <TitleBar />
        <MobileTitleBar />
        <div id="board" className="w-full aspect-square bg-red-500/50">
          {/* <Board /> */}
        </div>
        <ActionBar />
        <MobileActionBar />
      </div>
      <div id="right-sidebar" className="flex flex-grow items-center">
        <div className="hidden lg:flex w-full h-3/4 bg-yellow-500/50"></div>
      </div>
    </div>
  );
};

export default Test;
