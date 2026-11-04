import WaveDivider from './WaveDivider'

interface PageHeroProps {
  title: string
  subtitle?: string
  image?: string
}

export default function PageHero({ title, subtitle, image }: PageHeroProps) {
  return (
    <section className="relative flex min-h-[340px] items-center justify-center overflow-hidden bg-gradient-to-br from-navy-dark via-navy to-teal-dark px-6 pb-24 pt-20 text-center">
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full animate-ken-burns object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/70 via-navy/50 to-navy-dark/80" />
      <div className="relative z-10">
        <h1 className="font-display text-4xl font-light tracking-wide text-white sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-4 font-serif text-sm italic text-teal sm:text-base">{subtitle}</p> : null}
      </div>
      <WaveDivider className="absolute inset-x-0 bottom-0 text-white" />
    </section>
  )
}
