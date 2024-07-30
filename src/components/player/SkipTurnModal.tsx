import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { IconX } from "@tabler/icons-react";
import { FC } from "react";
import useGame from "../../hooks/useGame";

type Props = {
  open: boolean;
  onClose: () => void;
};

const SkipTurnModal: FC<Props> = ({ open, onClose }) => {
  const { skipTurn } = useGame();

  function skipAndClose() {
    skipTurn().then(() => onClose());
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm">
        <DialogPanel className="max-w-lg w-full space-y-4 border bg-white p-5 rounded-xl shadow-xl">
          <DialogTitle className="font-bold flex justify-between items-center">
            Skip Turn
            <IconX className="w-5" onClick={onClose} />
          </DialogTitle>
          <div>Are you sure you want to skip your turn?</div>
          <div className="flex gap-4 w-full justify-center">
            <button onClick={onClose}>Cancel</button>
            <button onClick={skipAndClose}>Confirm</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SkipTurnModal;
