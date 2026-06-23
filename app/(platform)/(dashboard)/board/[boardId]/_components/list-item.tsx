"use client";

import { ListWithCards } from "@/types";

import { ListHeader } from "./list-header";

interface ListItemProps {
  data: ListWithCards;
  index: number;
}

export const ListItem = ({ data, index }: ListItemProps) => {
  return (
    <li className="h-full w-68 shrink-0 select-none">
      <div className="w-full rounded-md bg-[#f1f2f4] pb-2 shadow-md">
        <ListHeader data={data} onAddCard={() => {}} />
      </div>
    </li>
  );
};
