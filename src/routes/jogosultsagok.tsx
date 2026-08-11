import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/jogosultsagok')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/jogosultsagok"!</div>
}
