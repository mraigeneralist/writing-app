import { useParams } from 'react-router-dom'

export default function Editor() {
  const { id } = useParams()
  return (
    <section>
      <h1 className="font-sans text-screen font-medium">editor</h1>
      <p className="mt-2 text-ui text-text-2">
        Document <code>{id}</code> — TipTap editor coming in a later phase.
      </p>
    </section>
  )
}
