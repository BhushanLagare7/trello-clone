"use client";

import { CSSProperties } from "react";

import { Draggable } from "@hello-pangea/dnd";

import { Card } from "@/lib/generated/prisma/client";

/** Props for the CardItem component */
interface CardItemProps {
  /** The card to display */
  data: Card;
  /** The index of the card */
  index: number;
}

/**
 * CardItem is a draggable component that displays a card on the board.
 * It is a wrapper around the Draggable component from the @hello-pangea/dnd library.
 */
export const CardItem = ({ data, index }: CardItemProps) => {
  return (
    /* Draggable component wraps the card item for drag-and-drop functionality */
    <Draggable draggableId={data.id} index={index}>
      {/* Provides the drag and drop props and the innerRef to the draggable item */}
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="truncate rounded-md border-2 border-transparent bg-white px-3 py-2 text-sm shadow-sm hover:border-black"
          role="button"
          style={provided.draggableProps.style as CSSProperties | undefined}
        >
          {data.title}
        </div>
      )}
    </Draggable>
  );
};
