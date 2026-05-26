type Props = { params: { id: string } }

export default function OwnerPoiDetail({ params }: Props) {
  return (
    <section className="container py-12">
      <h1 className="text-2xl font-bold">Manage POI {params.id}</h1>
      <p className="mt-2 text-slate-600">Edit details, media and status for this POI.</p>
    </section>
  )
}
