import { Card, List } from "./lib/generated/prisma/client";

// Type representing a list with its associated cards
export type ListWithCards = List & { cards: Card[] };

// Type representing a card with its associated list
export type CardWithList = Card & { list: List };
