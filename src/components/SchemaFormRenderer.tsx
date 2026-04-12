/**
 * SchemaFormRenderer
 *
 * A pure, schema-driven form renderer.
 * Accepts a list of FieldMeta definitions and a data record, and renders
 * the appropriate input widget for each field.
 *
 * Design principles:
 *  - IoC: all data and callbacks are injected via props (no Context reads)
 *  - Schema-driven: field type determines the widget, not hardcoded markup
 *  - Progressive disclosure: fields are grouped by disclosure level
 *
 * @see src/lib/field-registry.ts
 * @see ADR-004 in .github/ARCHITECTURE.md
 */
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FieldMeta } from '@/lib/field-registry'

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface SchemaFormRendererProps {
  /** Ordered list of field definitions to render */
  fields: readonly FieldMeta[]
  /** Current form values — must contain all field keys present in `fields` */
  values: Record<string, unknown>
  /** Called whenever the user changes a field value */
  onChange: (key: string, value: unknown) => void
  /** When true, all inputs are disabled */
  disabled?: boolean
  /**
   * If provided, only fields at this disclosure level (or below) are shown.
   * Defaults to 'basic'.
   */
  maxDisclosure?: FieldMeta['disclosure']
}

// ─── Disclosure order ─────────────────────────────────────────────────────────

const DISCLOSURE_ORDER: Record<NonNullable<FieldMeta['disclosure']>, number> = {
  basic: 0,
  advanced: 1,
  expert: 2,
}

function isVisible(
  field: FieldMeta,
  maxDisclosure: NonNullable<FieldMeta['disclosure']>,
): boolean {
  const fieldLevel = DISCLOSURE_ORDER[field.disclosure ?? 'basic']
  const maxLevel = DISCLOSURE_ORDER[maxDisclosure]
  return fieldLevel <= maxLevel
}

// ─── Individual field widgets ──────────────────────────────────────────────────

interface FieldProps {
  field: FieldMeta
  value: unknown
  onChange: (key: string, value: unknown) => void
  disabled: boolean
  baseId: string
}

function TextField({ field, value, onChange, disabled, baseId }: FieldProps) {
  const id = `${baseId}-${field.key}`
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive" aria-hidden>*</span>}
      </Label>
      <Input
        id={id}
        type={field.widget === 'url' ? 'url' : 'text'}
        value={typeof value === 'string' ? value : ''}
        placeholder={field.placeholder}
        disabled={disabled}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  )
}

function NumberField({ field, value, onChange, disabled, baseId }: FieldProps) {
  const id = `${baseId}-${field.key}`
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive" aria-hidden>*</span>}
      </Label>
      <Input
        id={id}
        type="number"
        value={typeof value === 'number' ? String(value) : ''}
        placeholder={field.placeholder}
        disabled={disabled}
        onChange={(e) => onChange(field.key, e.target.valueAsNumber)}
      />
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  )
}

function TextareaField({ field, value, onChange, disabled, baseId }: FieldProps) {
  const id = `${baseId}-${field.key}`
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive" aria-hidden>*</span>}
      </Label>
      <Textarea
        id={id}
        value={typeof value === 'string' ? value : ''}
        placeholder={field.placeholder}
        disabled={disabled}
        onChange={(e) => onChange(field.key, e.target.value)}
        rows={4}
      />
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  )
}

function BooleanField({ field, value, onChange, disabled, baseId }: FieldProps) {
  const id = `${baseId}-${field.key}`
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={typeof value === 'boolean' ? value : false}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(field.key, checked)}
      />
    </div>
  )
}

function SelectField({ field, value, onChange, disabled, baseId }: FieldProps) {
  const id = `${baseId}-${field.key}`
  const options = field.options ?? []
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive" aria-hidden>*</span>}
      </Label>
      <Select
        value={typeof value === 'string' ? value : ''}
        disabled={disabled}
        onValueChange={(v) => onChange(field.key, v)}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={field.placeholder ?? 'Select…'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  )
}

function TagsField({ field, value, onChange, disabled, baseId }: FieldProps) {
  const id = `${baseId}-${field.key}`
  const displayValue = Array.isArray(value) ? value.join(', ') : (typeof value === 'string' ? value : '')
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive" aria-hidden>*</span>}
      </Label>
      <Input
        id={id}
        value={displayValue}
        placeholder={field.placeholder ?? 'tag1, tag2, tag3'}
        disabled={disabled}
        onChange={(e) => {
          const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
          onChange(field.key, tags)
        }}
      />
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  )
}

// ─── Field dispatcher ─────────────────────────────────────────────────────────

function FieldWidget(props: FieldProps) {
  switch (props.field.widget) {
    case 'textarea':
      return <TextareaField {...props} />
    case 'number':
      return <NumberField {...props} />
    case 'boolean':
      return <BooleanField {...props} />
    case 'select':
      return <SelectField {...props} />
    case 'tags':
      return <TagsField {...props} />
    case 'text':
    case 'url':
    case 'date':
    case 'color':
    default:
      return <TextField {...props} />
  }
}

// ─── Main renderer ─────────────────────────────────────────────────────────────

/**
 * Renders a list of form fields driven by FieldMeta definitions.
 *
 * @example
 * const fields = getFieldsForSchema('gig')
 * <SchemaFormRenderer
 *   fields={fields}
 *   values={gigData}
 *   onChange={(key, value) => setGigData(prev => ({ ...prev, [key]: value }))}
 * />
 */
export default function SchemaFormRenderer({
  fields,
  values,
  onChange,
  disabled = false,
  maxDisclosure = 'basic',
}: SchemaFormRendererProps) {
  const baseId = useId()
  const visibleFields = fields.filter((f) => isVisible(f, maxDisclosure))

  if (visibleFields.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {visibleFields.map((field) => (
        <FieldWidget
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={onChange}
          disabled={disabled}
          baseId={baseId}
        />
      ))}
    </div>
  )
}
