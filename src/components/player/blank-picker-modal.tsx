"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function BlankPickerModal({
  open,
  onSelect,
  onClose,
}: {
  open: boolean;
  onSelect: (letter: string) => void;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Choose Blank Letter</DialogTitle>
          <DialogDescription>
            Pick the letter this blank tile should represent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
          {LETTERS.map((letter) => (
            <Button
              key={letter}
              type="button"
              variant="secondary"
              className="rounded-2xl px-3 py-3 text-sm"
              onClick={() => onSelect(letter)}
            >
              {letter}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
