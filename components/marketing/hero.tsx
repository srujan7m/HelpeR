'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5 pointer-events-none" />
      
      {/* Animated Blob Elements */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-8 px-4 py-1.5 bg-secondary/50 backdrop-blur-sm rounded-full border border-border/50"
        >
          <p className="text-xs font-medium text-muted-foreground">Welcome to the future of hiring</p>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight text-balance"
        >
          AI-Powered Multilingual Hiring OS
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance"
        >
          Screen resumes with AI, conduct interviews in any language, and get automated meeting summaries—all in one powerful platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-foreground text-background font-medium rounded-full hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="#features"
              className="px-8 py-3 border border-border/50 text-foreground font-medium rounded-full hover:bg-secondary/30 backdrop-blur-sm transition-colors"
            >
              Book Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-border/50"
        >
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <p className="font-accent text-sm text-muted-foreground mb-2">Resume Screening</p>
            <p className="text-xl font-semibold text-foreground">10x Faster</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <p className="font-accent text-sm text-muted-foreground mb-2">Multi-Language</p>
            <p className="text-xl font-semibold text-foreground">50+ Languages</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <p className="font-accent text-sm text-muted-foreground mb-2">Smart Scheduling</p>
            <p className="text-xl font-semibold text-foreground">Fully Automated</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
