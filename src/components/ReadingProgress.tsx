import { motion, useScroll, useSpring } from 'framer-motion'

/** Barrinha no topo da tela que mostra quanto da notícia já foi lido. */
export default function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[48] h-1 origin-left bg-gradient-to-r from-teal via-[#f6e3a0] to-gold"
      style={{ scaleX }}
    />
  )
}
