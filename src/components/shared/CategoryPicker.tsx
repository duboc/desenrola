import { useState, useEffect } from 'react'
import type { Category } from '@/types/models'

interface CategoryPickerProps {
  value: number | undefined
  onChange: (categoryId: number) => void
  type?: 'expense' | 'income'
}

export function CategoryPicker({ value, onChange, type }: CategoryPickerProps) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    window.api.system.getCategories().then((cats: Category[]) => {
      const filtered = type ? cats.filter(c => c.type === type) : cats
      setCategories(filtered)
    })
  }, [type])

  const parentCategories = categories.filter(c => !c.parentId)
  const getChildren = (parentId: number) =>
    categories.filter(c => c.parentId === parentId)

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      className="input"
    >
      <option value="">Selecione uma categoria</option>
      {parentCategories.map((parent) => {
        const children = getChildren(parent.id)
        if (children.length > 0) {
          return (
            <optgroup key={parent.id} label={`${parent.icon || ''} ${parent.name}`}>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.icon || ''} {child.name}
                </option>
              ))}
            </optgroup>
          )
        }
        return (
          <option key={parent.id} value={parent.id}>
            {parent.icon || ''} {parent.name}
          </option>
        )
      })}
    </select>
  )
}
