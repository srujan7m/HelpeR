'use client'

import { FileText, Globe, Clock, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: FileText,
    title: 'AI Resume Screening',
    description: 'Automatically review resumes and identify top candidates using advanced AI analysis and custom scoring criteria.',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Conduct interviews and communicate with candidates in 50+ languages with real-time translation.',
  },
  {
    icon: Clock,
    title: 'Interview Minutes',
    description: 'Auto-generated meeting transcripts and summaries with AI-powered insight generation.',
  },
  {
    icon: Zap,
    title: 'Smart Scheduling',
    description: 'Intelligent scheduling that works across time zones and finds available slots automatically.',
  },
]

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Powerful Features for Modern Hiring
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Everything you need to streamline your recruitment process and make data-driven hiring decisions.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-foreground/20 transition-colors group"
              >
                <motion.div
                  className="mb-4 p-3 rounded-lg bg-secondary/50 w-fit group-hover:bg-secondary transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon className="w-6 h-6 text-foreground" />
                </motion.div>
                <h3 className="font-accent text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
