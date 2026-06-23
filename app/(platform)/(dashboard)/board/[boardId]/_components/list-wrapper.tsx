/** Props for the ListWrapper component */
interface ListWrapperProps {
  children: React.ReactNode;
}

/**
 * ListWrapper component that wraps a list item with a fixed width and shrink behavior.
 * @param children - The content to be wrapped within the list item.
 */
export const ListWrapper = ({ children }: ListWrapperProps) => {
  return <li className="h-full w-68 shrink-0 select-none">{children}</li>;
};
