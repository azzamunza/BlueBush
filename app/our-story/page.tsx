'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Users, Award, Heart } from 'lucide-react';
import Link from 'next/link';

export default function OurStoryPage() {
  const values = [
    {
      icon: Leaf,
      title: 'Sustainability First',
      description: 'Every product is carefully sourced from ethical suppliers who share our commitment to environmental stewardship.',
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'We partner with local Australian artisans and manufacturers, supporting communities whilst reducing our carbon footprint.',
    },
    {
      icon: Award,
      title: 'Quality Craftsmanship',
      description: 'Timeless designs built to last generations, not seasons. We believe in investing in pieces that endure.',
    },
    {
      icon: Heart,
      title: 'Transparency',
      description: 'Full traceability from source to home. We share the complete journey of every product we create.',
    },
  ];

  const timeline = [
    {
      year: '2020',
      title: 'The Beginning',
      description: 'Founded in Melbourne with a vision to make sustainable living accessible and beautiful.',
    },
    {
      year: '2021',
      title: 'First Collection',
      description: 'Launched our inaugural bedroom collection featuring French linen and organic cotton.',
    },
    {
      year: '2023',
      title: 'Carbon Neutral',
      description: 'Achieved carbon neutral certification and planted our 10,000th native tree.',
    },
    {
      year: '2024',
      title: 'Expanding Reach',
      description: 'Opened our first physical showroom in Sydney and expanded to bathroom essentials.',
    },
    {
      year: '2026',
      title: 'Complete Home',
      description: 'Now offering sustainable solutions for every room in your home.',
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-br from-deep-forest via-emerald to-deep-teal text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 md:px-6 lg:px-12 h-full flex items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl text-paperbark leading-relaxed">
              Born from a love of the Australian landscape and a commitment to sustainable living
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-paperbark">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-deep-forest mb-6">
              Australian Grown. Sustainably Made.
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              BlueBush was founded on a simple belief: that beautiful, quality homewares shouldn't 
              come at the expense of our planet. Every piece we create honours the Australian 
              landscape that inspires us, whilst supporting the communities and ecosystems that 
              make our work possible.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              From our French linen sheet sets to our handcrafted ceramic tableware, each product 
              is thoughtfully designed, ethically sourced, and built to last – because quality 
              and sustainability should never be compromised.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-deep-forest mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-paperbark rounded-lg p-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald text-white rounded-full mb-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-deep-forest mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-br from-soft-sandstone to-paperbark">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-deep-forest mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From humble beginnings to a complete sustainable homewares collection
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative pl-8 pb-12 last:pb-0"
              >
                {/* Timeline Line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-3 top-8 w-0.5 h-full bg-emerald" />
                )}

                {/* Timeline Dot */}
                <div className="absolute left-0 top-0 w-6 h-6 bg-emerald rounded-full border-4 border-white" />

                {/* Content */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <span className="inline-block bg-deep-forest text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
                    {milestone.year}
                  </span>
                  <h3 className="text-xl font-bold text-deep-forest mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-700">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-deep-forest mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The difference we're making together
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '15,000+', label: 'Native Trees Planted' },
              { number: '100%', label: 'Carbon Neutral' },
              { number: '50+', label: 'Local Artisan Partners' },
              { number: '25,000+', label: 'Happy Customers' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-emerald mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-deep-forest text-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Join Us on the Journey
            </h2>
            <p className="text-xl text-paperbark mb-8 leading-relaxed">
              Every purchase supports sustainable practices and helps us plant more native Australian trees. 
              Together, we can make a difference.
            </p>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-deep-forest px-8 py-4 rounded-full font-medium hover:bg-vibrant-aqua transition-colors"
              >
                Shop Our Collection
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
