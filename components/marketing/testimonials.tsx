'use client'

import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: 'HelpeR reduced our hiring cycle from 6 weeks to 2 weeks. The AI screening alone saved us hundreds of hours.',
    author: 'Sarah Chen',
    role: 'HR Director at TechCorp',
    rating: 5,
  },
  {
    quote: 'The multi-language support has been a game-changer for our global hiring efforts. We can now tap talent worldwide.',
    author: 'Marcus Johnson',
    role: 'Founder at GlobalTalent Co',
    rating: 5,
  },
  {
    quote: 'Best investment we made for our recruitment team. The AI insights help us identify candidates we would have missed.',
    author: 'Elena Rodriguez',
    role: 'Talent Manager at InnovateLabs',
    rating: 5,
  },
]

export function Testimonials() {
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
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
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
            Loved by Hiring Teams
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of companies that have transformed their recruitment process.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-foreground/20 transition-colors"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star className="w-4 h-4 fill-foreground text-foreground" />
                  </motion.div>
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed text-balance">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div>
                <p className="font-accent font-semibold text-foreground">
                  {testimonial.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
