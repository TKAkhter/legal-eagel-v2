import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BulkStatusUpdateDialog } from './BulkStatusUpdateDialog'

const options = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
]

describe('BulkStatusUpdateDialog', () => {
  it('shows the selected count', () => {
    render(
      <BulkStatusUpdateDialog open onClose={() => {}} options={options} selectedCount={3} onApply={vi.fn()} />,
    )
    expect(screen.getByText(/status for 3 selected/)).toBeInTheDocument()
  })

  it('disables Apply until a value is chosen', async () => {
    const user = userEvent.setup()
    render(
      <BulkStatusUpdateDialog open onClose={() => {}} options={options} selectedCount={2} onApply={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Contacted' }))

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
  })

  it('calls onApply with the chosen value and then closes', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <BulkStatusUpdateDialog open onClose={onClose} options={options} selectedCount={2} onApply={onApply} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'New' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledWith('new')
    expect(onClose).toHaveBeenCalled()
  })

  it('does not carry a stale selection into a fresh open after Cancel', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn().mockResolvedValue(undefined)

    function TestHarness() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button onClick={() => setOpen(true)}>Reopen for a different batch</button>
          <BulkStatusUpdateDialog
            open={open}
            onClose={() => setOpen(false)}
            options={options}
            selectedCount={2}
            onApply={onApply}
          />
        </>
      )
    }

    render(<TestHarness />)

    // Pick a value, then Cancel (not Apply) — this is the reported flow.
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Contacted' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    // Simulate selecting a different batch of rows and reopening the dialog.
    await user.click(screen.getByText('Reopen for a different batch'))

    // The Apply button must NOT be silently enabled with the old value —
    // the dropdown should be back to its unselected placeholder state.
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByText(/^status…$/)).toBeInTheDocument()
  })
})
