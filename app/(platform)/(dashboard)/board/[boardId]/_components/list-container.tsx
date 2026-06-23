"use client";

import { ListWithCards } from "@/types";

import { ListForm } from "./list-form";

interface ListContainerProps {
  boardId: string;
  data: ListWithCards[];
}

const ListContainer = ({ boardId, data }: ListContainerProps) => {
  return (
    <ol>
      <ListForm />
      <div className="w-1 shrink-0" />
    </ol>
  );
};

export default ListContainer;
