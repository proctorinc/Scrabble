import { Transition } from "@headlessui/react";
import useScoreAlert from "../../hooks/useScoreAlert";

const ScoreAlert = () => {
  const { points, isActive } = useScoreAlert();

  return (
    <Transition show={isActive}>
      <div className="absolute w-full h-full flex justify-center items-center z-50">
        <div className="flex items-center justify-center bg-gradient-to-tr from-emerald-600 to-emerald-300 rounded-full aspect-square font-semibold p-2 shadow-2xl">
          <div className="select-none flex items-center justify-center bg-white rounded-full aspect-square text-5xl font-semibold p-5">
            +{points}
          </div>
        </div>
      </div>
      <div className="transform translate-x-72 translate-y-72 duration-75 w-10 h-10 bg-red-500 shadow-2xl rounded-full"></div>
    </Transition>
  );
};

export default ScoreAlert;
