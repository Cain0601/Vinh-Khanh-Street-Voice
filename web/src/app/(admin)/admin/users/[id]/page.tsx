type Props = { params: { id: string } }

export default function AdminUserDetail({ params }: Props) {
  return (
    <section className="container py-12">
      <h1 className="text-2xl font-bold">User {params.id}</h1>
      <p className="mt-2 text-slate-600">View and edit user details and roles.</p>
    </section>
  )
}
