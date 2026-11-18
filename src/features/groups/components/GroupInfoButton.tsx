"use client";

import { Info } from "lucide-react";
import { Button } from "@/ui/primitives/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/primitives/sheet";
import type { GroupSummary } from "../types";
import { GroupInfoPanel } from "./GroupInfoPanel";

interface GroupInfoButtonProps {
  group: GroupSummary;
}

export function GroupInfoButton({ group }: GroupInfoButtonProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Group info">
            <Info />
          </Button>
        }
      />
      <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{group.name}</SheetTitle>
          <SheetDescription>
            {group.participantIds.length} members
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <GroupInfoPanel group={group} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
