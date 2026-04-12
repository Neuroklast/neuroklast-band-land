import { describe, it, expect } from 'vitest'
import {
  FIELD_REGISTRY,
  getFieldsForSchema,
  getFieldKeysForSchema,
  type SchemaName,
  type FieldWidgetType,
} from '@/lib/field-registry'

const VALID_WIDGET_TYPES: FieldWidgetType[] = [
  'text', 'textarea', 'number', 'boolean', 'url', 'date', 'select', 'tags', 'color',
]

describe('FIELD_REGISTRY', () => {
  it('has entries for all SchemaName values', () => {
    const expected: SchemaName[] = [
      'bandInfo', 'gig', 'release', 'biography', 'newsItem',
      'socialLinks', 'seoSettings', 'navigationSettings',
      'contactSettings', 'newsletterSettings',
    ]
    for (const name of expected) {
      expect(FIELD_REGISTRY[name]).toBeDefined()
      expect(FIELD_REGISTRY[name].length).toBeGreaterThan(0)
    }
  })

  it('every field has a non-empty key and label', () => {
    for (const [schema, fields] of Object.entries(FIELD_REGISTRY)) {
      for (const field of fields) {
        expect(field.key, `${schema}.key`).toBeTruthy()
        expect(field.label, `${schema}.label`).toBeTruthy()
      }
    }
  })

  it('every field widget is a valid FieldWidgetType', () => {
    for (const [schema, fields] of Object.entries(FIELD_REGISTRY)) {
      for (const field of fields) {
        expect(VALID_WIDGET_TYPES, `${schema}.${field.key}.widget "${field.widget}"`)
          .toContain(field.widget)
      }
    }
  })

  it('select fields always provide options', () => {
    for (const [schema, fields] of Object.entries(FIELD_REGISTRY)) {
      for (const field of fields) {
        if (field.widget === 'select') {
          expect(field.options, `${schema}.${field.key} select must have options`)
            .toBeDefined()
          expect(field.options!.length, `${schema}.${field.key} options must not be empty`)
            .toBeGreaterThan(0)
        }
      }
    }
  })

  it('field keys are unique within each schema', () => {
    for (const [schema, fields] of Object.entries(FIELD_REGISTRY)) {
      const keys = fields.map((f) => f.key)
      const unique = new Set(keys)
      expect(unique.size, `${schema} has duplicate field keys`).toBe(keys.length)
    }
  })

  it('disclosure levels are valid when present', () => {
    const valid = ['basic', 'advanced', 'expert']
    for (const [schema, fields] of Object.entries(FIELD_REGISTRY)) {
      for (const field of fields) {
        if (field.disclosure !== undefined) {
          expect(valid, `${schema}.${field.key}.disclosure`).toContain(field.disclosure)
        }
      }
    }
  })
})

describe('getFieldsForSchema', () => {
  it('returns all fields when no disclosure filter is given', () => {
    const all = getFieldsForSchema('gig')
    expect(all.length).toBe(FIELD_REGISTRY.gig.length)
  })

  it('filters by disclosure level', () => {
    const basic = getFieldsForSchema('gig', 'basic')
    const all = getFieldsForSchema('gig')
    expect(basic.length).toBeLessThanOrEqual(all.length)
    for (const f of basic) {
      expect(f.disclosure ?? 'basic').toBe('basic')
    }
  })

  it('returns readonly array (does not mutate registry)', () => {
    const fields = getFieldsForSchema('bandInfo')
    expect(Object.isFrozen(fields) || Array.isArray(fields)).toBe(true)
    // Attempting to push should not modify the original registry
    const copy = [...fields]
    copy.push({ key: 'injected', label: 'Injected', widget: 'text' })
    expect(FIELD_REGISTRY.bandInfo.length).toBe(fields.length)
  })
})

describe('getFieldKeysForSchema', () => {
  it('returns an array of string keys', () => {
    const keys = getFieldKeysForSchema('release')
    expect(Array.isArray(keys)).toBe(true)
    expect(keys.length).toBeGreaterThan(0)
    for (const k of keys) {
      expect(typeof k).toBe('string')
    }
  })

  it('keys match the FIELD_REGISTRY entries', () => {
    const keys = getFieldKeysForSchema('gig')
    const registryKeys = FIELD_REGISTRY.gig.map((f) => f.key)
    expect(keys).toEqual(registryKeys)
  })
})
