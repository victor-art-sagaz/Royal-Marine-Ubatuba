import PageHero from '../components/PageHero'

interface ComingProps {
  title: string
  subtitle?: string
  image?: string
}

export default function Coming({ title, subtitle, image }: ComingProps) {
  return (
    <>
      <PageHero title={title} subtitle={subtitle} image={image} />
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="font-serif text-sm italic text-teal-dark">Esta página será montada nas próximas etapas.</p>
      </section>
    </>
  )
}
