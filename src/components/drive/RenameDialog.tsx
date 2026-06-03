"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RenameDialog({
  open,
  initialName,
  pending,
  onOpenChange,
  onRename,
}: {
  open: boolean;
  initialName: string;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onRename(name);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="rename-name">Name</Label>
            <Input id="rename-name" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
