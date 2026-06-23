"use client";

import { ComponentRef, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { ListWithCards } from "@/types";

import { CardForm } from "./card-form";
import { CardItem } from "./card-item";
import { ListHeader } from "./list-header";

/** Props for the ListItem component */
interface ListItemProps {
  data: ListWithCards;
  index: number;
}

export const ListItem = ({ data, index }: ListItemProps) => {
  const textareaRef = useRef<ComponentRef<"textarea">>(null);

  const [isEditing, setIsEditing] = useState(false);

  /**
   * Enables editing mode for the list item, focusing the textarea for input.
   * Sets isEditing to true and focuses the textarea after a short delay.
   */
  const disableEditing = () => {
    setIsEditing(false);
  };

  /**
   * Enables editing mode for the list item, focusing the textarea for input.
   * Sets isEditing to true and focuses the textarea after a short delay.
   */
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  return (
    <li className="h-full w-68 shrink-0 select-none">
      <div className="w-full rounded-md bg-[#f1f2f4] pb-2 shadow-md">
        {/* Renders the list header and card form, with editing controls */}
        <ListHeader data={data} onAddCard={enableEditing} />
        {/* Renders the list items as draggable cards */}
        <ol
          className={cn(
            "mx-1 flex flex-col gap-y-2 px-1 py-0.5",
            data.cards.length > 0 ? "mt-2" : "mt-0",
          )}
        >
          {data.cards.map((card, index) => (
            <CardItem key={card.id} data={card} index={index} />
          ))}
        </ol>
        {/* Renders the card form for adding new cards, with editing controls */}
        <CardForm
          ref={textareaRef}
          disableEditing={disableEditing}
          enableEditing={enableEditing}
          isEditing={isEditing}
          listId={data.id}
        />
      </div>
    </li>
  );
};
