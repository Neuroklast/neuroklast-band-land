import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminVisibilityToggle } from './AdminVisibilityToggle'

describe('AdminVisibilityToggle', () => {
  const labels = { showLabel: 'Show file on site', hideLabel: 'Hide file on site' }

  it('preserves the visible label and calls the domain action with the new state', async () => {
    const onToggle = vi.fn().mockResolvedValue({ success: true })
    render(<AdminVisibilityToggle id="file-1" initialActive onToggle={onToggle} {...labels} />)

    const button = screen.getByRole('button', { name: labels.hideLabel })
    expect(button).toHaveTextContent('Visible')
    expect(button).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(button)
    expect(onToggle).toHaveBeenCalledWith('file-1', false)
    await waitFor(() => expect(screen.getByRole('button', { name: labels.showLabel })).toHaveTextContent('Hidden'))
  })

  it('rolls back an optimistic toggle if the server returns an error', async () => {
    const onToggle = vi.fn().mockResolvedValue({ error: 'Access denied' })
    render(<AdminVisibilityToggle id="file-2" initialActive={false} onToggle={onToggle} {...labels} />)
    fireEvent.click(screen.getByRole('button', { name: labels.showLabel }))
    await waitFor(() => expect(screen.getByRole('button', { name: labels.showLabel })).toHaveTextContent('Hidden'))
    expect(onToggle).toHaveBeenCalledWith('file-2', true)
  })

  it('rolls back an optimistic toggle if the server action throws', async () => {
    const onToggle = vi.fn().mockRejectedValue(new Error('Network unavailable'))
    render(<AdminVisibilityToggle id="file-3" initialActive onToggle={onToggle} {...labels} />)
    fireEvent.click(screen.getByRole('button', { name: labels.hideLabel }))
    await waitFor(() => expect(screen.getByRole('button', { name: labels.hideLabel })).toHaveTextContent('Visible'))
  })
})
