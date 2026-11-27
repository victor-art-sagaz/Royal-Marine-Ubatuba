import { useState } from 'react'
import { ExternalLink, Info, LayoutGrid, Lightbulb, ShoppingBag, Tag } from 'lucide-react'
import GlassButton from '../components/GlassButton'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { images } from '../data/site'
import { getStoreCategory, mercadoLivreSearchUrl, storeCategories, storeProducts } from '../data/loja'
import type { StoreCategoryId, StoreProduct } from '../data/loja'

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function ProductCard({ product }: { product: StoreProduct }) {
  const category = getStoreCategory(product.category)
  const Icon = category?.icon ?? ShoppingBag
  const discount =
    product.price && product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Foto (no teste: ilustração com o ícone da categoria) */}
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-[#0e3a52]">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full bg-white object-contain p-4" loading="lazy" />
        ) : (
          <Icon size={64} className="text-teal/80" aria-hidden="true" />
        )}
        {discount ? (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy-dark">
            −{discount}%
          </span>
        ) : null}
        {product.example ? (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-navy">
            Exemplo
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-teal-dark">{category?.label}</p>
        <h3 className="mt-1 font-display text-xl leading-snug tracking-wide text-navy">{product.name}</h3>
        <p className="mt-2 text-sm font-light leading-relaxed">{product.blurb}</p>
        {product.tip ? (
          <p className="mt-3 flex gap-2 rounded-2xl bg-teal/10 px-3 py-2 text-xs text-navy">
            <Lightbulb size={14} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" />
            {product.tip}
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          {product.price ? (
            <p className="mb-3">
              {product.oldPrice ? <span className="mr-2 text-sm text-slate-400 line-through">{money(product.oldPrice)}</span> : null}
              <span className="font-display text-2xl text-navy">{money(product.price)}</span>
            </p>
          ) : (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
              <Tag size={13} aria-hidden="true" /> Preço e desconto atualizados todo dia
            </p>
          )}
          <a
            href={product.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-medium text-white transition hover:bg-navy-dark"
          >
            Ver no Mercado Livre <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  )
}

/** Página /loja: Loja do Navegante (TESTE). */
export default function Store() {
  const [active, setActive] = useState<StoreCategoryId | 'todos'>('todos')
  const visible = active === 'todos' ? storeProducts : storeProducts.filter((p) => p.category === active)
  const activeCategory = active === 'todos' ? null : getStoreCategory(active)

  return (
    <>
      <PageHero title="LOJA DO NAVEGANTE" subtitle="Achados para o seu barco, a pesca e a praia" image={images.ubatubaEnseada} />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Reveal className="mb-8 text-center">
          <p className="font-serif text-sm italic text-teal-dark">Escolhidos pela equipe Royal Marine</p>
          <h2 className="mt-2 font-display text-3xl font-light sm:text-4xl">Ofertas para quem vive o mar</h2>
          <div className="mx-auto mt-5 h-0.5 w-10 bg-teal" />
          <p className="mx-auto mt-5 max-w-2xl text-sm font-light leading-relaxed">
            Produtos que fazem diferença a bordo e na praia, com as melhores ofertas do Mercado Livre. A compra, a entrega e
            a garantia são feitas pelo Mercado Livre e pelo vendedor do anúncio.
          </p>
        </Reveal>

        {/* Aviso do teste */}
        <div className="mx-auto mb-8 flex max-w-3xl gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-navy">
          <Info size={20} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
          <p>
            <strong className="font-medium">Versão de teste.</strong> Os produtos são exemplos para ver o visual: os botões
            abrem uma busca no Mercado Livre. Na versão final, as fotos, os preços e os descontos vêm do Mercado Livre e são
            atualizados todo dia.
          </p>
        </div>

        {/* Categorias */}
        <div className="-mx-4 mb-8 overflow-x-auto px-4 pb-2">
          <div className="flex min-w-max gap-2 sm:flex-wrap sm:justify-center" role="tablist" aria-label="Categorias">
            {[{ id: 'todos' as const, label: 'Todos', icon: LayoutGrid }, ...storeCategories].map((cat) => {
              const Icon = cat.icon
              const selected = active === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selected ? 'border-navy bg-navy text-white shadow-lg' : 'border-slate-200 bg-white text-navy hover:border-teal'
                  }`}
                >
                  <Icon size={16} className={selected ? 'text-teal' : 'text-teal-dark'} aria-hidden="true" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {activeCategory ? (
          <p className="mb-6 text-center text-sm font-light text-slate-600">{activeCategory.description}</p>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product, i) => (
            <Reveal key={product.id} delay={(i % 3) * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        {activeCategory ? (
          <div className="mt-10 text-center">
            <GlassButton
              href={mercadoLivreSearchUrl(activeCategory.searchTerm)}
              external
              tone="dark"
              icon={<ExternalLink size={16} aria-hidden="true" />}
            >
              Ver mais de {activeCategory.label} no Mercado Livre
            </GlassButton>
          </div>
        ) : null}

        <p className="mx-auto mt-12 max-w-3xl text-center text-xs font-light leading-relaxed text-slate-500">
          Transparência: esta página tem links de afiliado. Se você comprar por eles, a Royal Marine pode receber uma pequena
          comissão do Mercado Livre, sem nenhum custo a mais para você. Preços e disponibilidade podem mudar a qualquer
          momento; vale sempre o que aparece no Mercado Livre na hora da compra. Na dúvida sobre a peça certa para o seu motor,
          fale com a nossa equipe antes de comprar.
        </p>
      </section>
    </>
  )
}
