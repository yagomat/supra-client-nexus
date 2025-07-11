
interface ClientePaginationInfoProps {
  viewMode: 'cards' | 'matriz';
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export const ClientePaginationInfo = ({
  viewMode,
  currentPage,
  itemsPerPage,
  totalItems
}: ClientePaginationInfoProps) => {
  if (totalItems === 0) {
    return <div></div>;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
      {viewMode === 'cards' ? (
        `${startItem} até ${endItem} de ${totalItems}`
      ) : (
        `${totalItems} cliente${totalItems !== 1 ? 's' : ''}`
      )}
    </span>
  );
};
