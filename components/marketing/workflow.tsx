'use client'

import { FileText, CheckCircle, Video, CheckSquare } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  {
    icon: FileText,
    title: 'Apply',
    description: 'Candidates submit their application with resume',
  },
  {
    icon: CheckCircle,
    title: 'Screen',
    description: 'AI analyzes and scores candidates automatically',
  },
  {
    icon: Video,
    title: 'Interview',
    description: 'Conduct and transcribe interviews in any language',
  },
  {
    icon: CheckSquare,
    title: 'Hire',
    description: 'Make informed decisions with AI insights',
  },
]

export function Workflow() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/10 to-background">
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From application to offer in just a few days with our streamlined process.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm h-full hover:border-foreground/20 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className="p-3 rounded-lg bg-secondary/50"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-5 h-5 text-foreground" />
                    </motion.div>
                    <div className="text-sm font-semibold text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <h3 className="font-accent text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Arrow Divider */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.15, duration: 0.5 }}
                  >
                    <div className="w-6 h-0.5 bg-gradient-to-r from-border to-transparent origin-left" />
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
