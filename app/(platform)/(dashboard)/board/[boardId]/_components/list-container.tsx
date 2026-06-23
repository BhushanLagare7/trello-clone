"use client";

import { useState } from "react";

import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";

import { updateCardOrder } from "@/actions/update-card-order";
import { updateListOrder } from "@/actions/update-list-order";
import { useAction } from "@/hooks/use-action";
import { ListWithCards } from "@/types";

import { ListForm } from "./list-form";
import { ListItem } from "./list-item";

interface ListContainerProps {
  /** Array of lists with their associated cards to be displayed on the board */
  data: ListWithCards[];
  /** Unique identifier for the current board */
  boardId: string;
}

/**
 * Reorders an array by moving an element from startIndex to endIndex.
 * Returns a new array without mutating the original.
 */
function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

/**
 * ListContainer is responsible for rendering and managing the drag-and-drop
 * functionality for lists and cards within a board. It handles:
 * - Reordering lists horizontally via drag and drop
 * - Moving cards within the same list or across different lists
 * - Persisting order changes to the server with optimistic UI updates
 */
export const ListContainer = ({ data, boardId }: ListContainerProps) => {
  const [orderedData, setOrderedData] = useState(data);
  const [prevData, setPrevData] = useState(data);

  // Sync local state when server data changes (recommended React pattern:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  if (data !== prevData) {
    setPrevData(data);
    setOrderedData(data);
  }

  /** Persists the new list order to the server after a list is reordered */
  const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
    onSuccess: () => {
      toast.success("List reordered");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  /** Persists the new card order to the server after a card is moved */
  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success("Card reordered");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  /**
   * Handles the end of a drag event for both lists and cards.
   * Applies optimistic UI updates locally and syncs changes to the server.
   *
   * @param result - The drag result containing source, destination and type information
   */
  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    // Exit if dropped outside any droppable area
    if (!destination) {
      return;
    }

    // if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // User moves a list
    if (type === "list") {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index }),
      );

      setOrderedData(items);
      executeUpdateListOrder({ items, boardId });
    }

    // User moves a card
    if (type === "card") {
      const newOrderedData = [...orderedData];

      // Source and destination list
      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId,
      );
      const destList = newOrderedData.find(
        (list) => list.id === destination.droppableId,
      );

      if (!sourceList || !destList) {
        return;
      }

      // Check if cards exists on the sourceList
      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      // Check if cards exists on the destList
      if (!destList.cards) {
        destList.cards = [];
      }

      // Moving the card in the same list
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index,
        );

        reorderedCards.forEach((card, idx) => {
          card.order = idx;
        });

        sourceList.cards = reorderedCards;

        setOrderedData(newOrderedData);
        executeUpdateCardOrder({
          boardId: boardId,
          items: reorderedCards,
        });
        // User moves the card to another list
      } else {
        // Remove card from the source list
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        // Assign the new listId to the moved card
        movedCard.listId = destination.droppableId;

        // Add card to the destination list
        destList.cards.splice(destination.index, 0, movedCard);

        sourceList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        // Update the order for each card in the destination list
        destList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        setOrderedData(newOrderedData);
        executeUpdateCardOrder({
          boardId: boardId,
          items: destList.cards,
        });
      }
    }
  };

  return (
    /* DragDropContext wraps the entire drag-and-drop area for lists and cards */
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Horizontal droppable area for list reordering */}
      <Droppable direction="horizontal" droppableId="lists" type="list">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex h-full gap-x-3"
          >
            {orderedData.map((list, index) => {
              return <ListItem key={list.id} data={list} index={index} />;
            })}
            {provided.placeholder}
            {/* Form to create a new list */}
            <ListForm />
            <div className="w-1 shrink-0" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
