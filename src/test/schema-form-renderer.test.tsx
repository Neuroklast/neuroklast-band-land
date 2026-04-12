import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SchemaFormRenderer from '@/components/SchemaFormRenderer'
import type { FieldMeta } from '@/lib/field-registry'

const TEXT_FIELD: FieldMeta = { key: 'title', label: 'Title', widget: 'text', disclosure: 'basic' }
const REQUIRED_FIELD: FieldMeta = { key: 'name', label: 'Name', widget: 'text', required: true, disclosure: 'basic' }
const BOOLEAN_FIELD: FieldMeta = { key: 'active', label: 'Active', widget: 'boolean', disclosure: 'basic' }
const SELECT_FIELD: FieldMeta = {
  key: 'type',
  label: 'Type',
  widget: 'select',
  options: [{ value: 'album', label: 'Album' }, { value: 'ep', label: 'EP' }],
  disclosure: 'basic',
}
const TEXTAREA_FIELD: FieldMeta = { key: 'bio', label: 'Biography', widget: 'textarea', disclosure: 'basic' }
const TAGS_FIELD: FieldMeta = { key: 'genres', label: 'Genres', widget: 'tags', disclosure: 'basic' }
const ADVANCED_FIELD: FieldMeta = { key: 'secret', label: 'Secret', widget: 'text', disclosure: 'advanced' }

describe('SchemaFormRenderer', () => {
  it('renders nothing when fields list is empty', () => {
    const { container } = render(
      <SchemaFormRenderer fields={[]} values={{}} onChange={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders a text field with label and input', () => {
    render(
      <SchemaFormRenderer
        fields={[TEXT_FIELD]}
        values={{ title: 'Hello' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument()
  })

  it('renders required marker for required fields', () => {
    render(
      <SchemaFormRenderer
        fields={[REQUIRED_FIELD]}
        values={{ name: '' }}
        onChange={vi.fn()}
      />
    )
    // The asterisk is present in the DOM
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('calls onChange with correct key and value on text input', () => {
    const onChange = vi.fn()
    render(
      <SchemaFormRenderer
        fields={[TEXT_FIELD]}
        values={{ title: '' }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Title' } })
    expect(onChange).toHaveBeenCalledWith('title', 'New Title')
  })

  it('renders textarea for textarea widget', () => {
    render(
      <SchemaFormRenderer
        fields={[TEXTAREA_FIELD]}
        values={{ bio: 'Some text' }}
        onChange={vi.fn()}
      />
    )
    const textarea = screen.getByLabelText('Biography')
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('renders tags field and parses comma-separated input', () => {
    const onChange = vi.fn()
    render(
      <SchemaFormRenderer
        fields={[TAGS_FIELD]}
        values={{ genres: ['INDUSTRIAL', 'EBM'] }}
        onChange={onChange}
      />
    )
    const input = screen.getByLabelText('Genres')
    fireEvent.change(input, { target: { value: 'TECHNO, EBM, INDUSTRIAL' } })
    expect(onChange).toHaveBeenCalledWith('genres', ['TECHNO', 'EBM', 'INDUSTRIAL'])
  })

  it('hides advanced fields when maxDisclosure is basic (default)', () => {
    render(
      <SchemaFormRenderer
        fields={[TEXT_FIELD, ADVANCED_FIELD]}
        values={{ title: '', secret: '' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.queryByLabelText('Secret')).toBeNull()
  })

  it('shows advanced fields when maxDisclosure is advanced', () => {
    render(
      <SchemaFormRenderer
        fields={[TEXT_FIELD, ADVANCED_FIELD]}
        values={{ title: '', secret: '' }}
        onChange={vi.fn()}
        maxDisclosure="advanced"
      />
    )
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Secret')).toBeInTheDocument()
  })

  it('disables all inputs when disabled prop is true', () => {
    render(
      <SchemaFormRenderer
        fields={[TEXT_FIELD, TEXTAREA_FIELD]}
        values={{ title: 'x', bio: 'y' }}
        onChange={vi.fn()}
        disabled={true}
        maxDisclosure="advanced"
      />
    )
    expect(screen.getByLabelText('Title')).toBeDisabled()
    expect(screen.getByLabelText('Biography')).toBeDisabled()
  })

  it('renders boolean field as a switch', () => {
    const onChange = vi.fn()
    render(
      <SchemaFormRenderer
        fields={[BOOLEAN_FIELD]}
        values={{ active: true }}
        onChange={onChange}
      />
    )
    // Switch renders with role="switch"
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('renders select field with options', () => {
    render(
      <SchemaFormRenderer
        fields={[SELECT_FIELD]}
        values={{ type: 'album' }}
        onChange={vi.fn()}
      />
    )
    // Combobox is rendered by Radix Select
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
