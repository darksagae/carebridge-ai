import { redirect } from 'next/navigation'

// The app lives on the home page; keep old links working.
export default function PreparePage() {
  redirect('/')
}
