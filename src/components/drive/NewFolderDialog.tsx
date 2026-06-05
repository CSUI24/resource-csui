"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewFolderDialog({
  open,
  onOpenChange,
  onCreate,
  pending,
  label = "Folder",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
  pending: boolean;
  label?: "Course" | "Folder";
}) {
  const [name, setName] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setName("");
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New {label}</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new {label.toLowerCase()} in the current workspace.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onCreate(name);
            setName("");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="folder-name">{label} name</Label>
            <Input id="folder-name" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
