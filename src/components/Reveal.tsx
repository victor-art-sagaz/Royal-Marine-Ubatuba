import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

/** Faz o conteúdo surgir suavemente quando aparece na tela. */
export default function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
