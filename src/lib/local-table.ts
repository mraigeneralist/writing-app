// A tiny localStorage-backed table used in local mode (no Supabase configured).
// Each table mirrors the shape the Supabase queries will use, so swapping in the
// real backend later is a localized change in lib/queries/_tables.ts.

export const LOCAL_USER_ID = 'local-user'

const PREFIX = 'loom.'

interface BaseRow {
  id: string
  user_id: string
  created_at: string
}

function read<Row>(name: string): Row[] {
  const raw = localStorage.getItem(PREFIX + name)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Row[]
  } catch {
    return []
  }
}

function write<Row>(name: string, rows: Row[]): void {
  localStorage.setItem(PREFIX + name, JSON.stringify(rows))
}

export interface LocalTable<Row extends BaseRow> {
  list(): Promise<Row[]>
  insert(values: Partial<Row>): Promise<Row>
  update(id: string, patch: Partial<Row>): Promise<Row>
  remove(id: string): Promise<void>
}

export function localTable<Row extends BaseRow>(name: string): LocalTable<Row> {
  return {
    async list() {
      return read<Row>(name)
    },
    async insert(values) {
      const rows = read<Row>(name)
      const row = {
        id: crypto.randomUUID(),
        user_id: LOCAL_USER_ID,
        created_at: new Date().toISOString(),
        ...values,
      } as Row
      rows.push(row)
      write(name, rows)
      return row
    },
    async update(id, patch) {
      const rows = read<Row>(name)
      const i = rows.findIndex((r) => r.id === id)
      if (i === -1) throw new Error(`${name}: row ${id} not found`)
      rows[i] = { ...rows[i], ...patch }
      write(name, rows)
      return rows[i]
    },
    async remove(id) {
      write(
        name,
        read<Row>(name).filter((r) => r.id !== id),
      )
    },
  }
}
