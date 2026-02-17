'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-foreground relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-background/10 rounded-full blur-3xl"
        animate={{
          y: [0, 20, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-4xl mx-auto text-center"
      >
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-background mb-6 text-balance">
          Ready to Transform Your Hiring?
        </h2>
        <p className="text-lg text-background/80 mb-8 max-w-2xl mx-auto text-balance">
          Join hundreds of companies that are hiring smarter, faster, and better with HelpeR.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-background text-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
