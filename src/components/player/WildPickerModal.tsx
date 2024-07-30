import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { IconX } from "@tabler/icons-react";
import { FC } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (letter: string) => void;
};

const WildPickerModal: FC<Props> = ({ open, onClose, onSelect }) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm">
        <DialogPanel className="max-w-sm w-full space-y-4 border bg-white p-5 rounded-xl shadow-xl">
          <DialogTitle className="font-bold flex justify-between items-center">
            Select Letter
            <IconX className="w-5" onClick={onClose} />
          </DialogTitle>
          <div className="grid grid-cols-6 gap-3">
            {letters.split("").map((letter) => {
              return (
                <button
                  key={`letter-count-${letter}`}
                  onClick={() => {
                    onSelect(letter);
                    onClose();
                  }}
                  className="rounded-lg text-center bg-gray-200 w-full p-2 shadow-inner"
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default WildPickerModal;
