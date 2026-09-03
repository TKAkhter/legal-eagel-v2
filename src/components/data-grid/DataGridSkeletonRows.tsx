import { TableRow, TableCell, Skeleton } from '@mui/material'

export function DataGridSkeletonRows({ rowCount, columnCount }: { rowCount: number; columnCount: number }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: columnCount }).map((__, c) => (
            <TableCell key={c}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
