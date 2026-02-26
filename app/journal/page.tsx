'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function JournalPage() {
  const articles = [
    {
      id: 1,
      title: 'The Complete Guide to Caring for French Linen',
      excerpt: 'Discover the secrets to keeping your French linen sheets soft, beautiful, and lasting for generations. From washing tips to storage solutions.',
      category: 'Care Guides',
      author: 'Emma Thompson',
      date: '2026-02-15',
      readTime: '5 min read',
      image: 'linen-care',
    },
    {
      id: 2,
      title: 'Why Bamboo is the Future of Sustainable Textiles',
      excerpt: 'Explore the environmental benefits of bamboo fabric and why it\'s becoming the go-to choice for eco-conscious homeowners.',
      category: 'Sustainability',
      author: 'James Cooper',
      date: '2026-02-10',
      readTime: '7 min read',
      image: 'bamboo',
    },
    {
      id: 3,
      title: '5 Ways to Create a More Sustainable Bedroom',
      excerpt: 'Simple swaps and mindful choices that can transform your bedroom into an eco-friendly sanctuary without compromising on style.',
      category: 'Home Tips',
      author: 'Sarah Mitchell',
      date: '2026-02-05',
      readTime: '6 min read',
      image: 'bedroom',
    },
    {
      id: 4,
      title: 'The Journey of Our Saltbush Ceramics',
      excerpt: 'Meet the artisan behind our beautiful handcrafted ceramic collection and learn about the traditional techniques that make each piece unique.',
      category: 'Artisan Stories',
      author: 'Michael Chen',
      date: '2026-01-28',
      readTime: '8 min read',
      image: 'ceramics',
    },
    {
      id: 5,
      title: 'Understanding Organic Cotton Certifications',
      excerpt: 'A comprehensive breakdown of GOTS, OEKO-TEX, and other certifications to help you make informed choices.',
      category: 'Education',
      author: 'Emma Thompson',
      date: '2026-01-20',
      readTime: '10 min read',
      image: 'cotton',
    },
    {
      id: 6,
      title: 'Seasonal Living: Transitioning Your Home for Winter',
      excerpt: 'Discover how to create a cosy, sustainable winter haven with natural materials and thoughtful layering.',
      category: 'Seasonal',
      author: 'Sarah Mitchell',
      date: '2026-01-15',
      readTime: '6 min read',
      image: 'winter',
    },
  ];

  const categories = ['All', 'Sustainability', 'Care Guides', 'Home Tips', 'Artisan Stories', 'Education'];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-forest via-emerald to-deep-teal text-white py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              The BlueBush Journal
            </h1>
            <p className="text-lg md:text-xl text-paperbark">
              Sustainable living tips, care guides, and stories from our artisan community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-soft-sandstone/30 py-4">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors bg-paperbark text-deep-forest hover:bg-deep-forest hover:text-white"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16 bg-paperbark">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg overflow-hidden shadow-lg"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-emerald to-deep-teal flex items-center justify-center text-white text-2xl">
                Featured Article Image
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-block bg-vibrant-aqua text-deep-forest text-sm font-bold px-3 py-1 rounded-full mb-4 w-fit">
                  Featured
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-deep-forest mb-4">
                  {articles[0].title}
                </h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {articles[0].author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(articles[0].date).toLocaleDateString('en-AU')}
                  </span>
                  <span>{articles[0].readTime}</span>
                </div>
                <Link href={`/journal/${articles[0].id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-deep-forest text-white px-6 py-3 rounded-full font-medium hover:bg-emerald transition-colors inline-flex items-center gap-2 w-fit"
                  >
                    Read Article
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-forest mb-12">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow group"
              >
                <Link href={`/journal/${article.id}`}>
                  <div className="aspect-video bg-gradient-to-br from-soft-sandstone to-paperbark flex items-center justify-center text-gray-400">
                    Article Image
                  </div>
                  <div className="p-6">
                    <span className="inline-block bg-paperbark text-deep-forest text-xs font-medium px-3 py-1 rounded-full mb-3">
                      {article.category}
                    </span>
                    <h3 className="text-xl font-bold text-deep-forest mb-3 group-hover:text-emerald transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.date).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-deep-forest to-emerald text-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Never Miss an Article
            </h2>
            <p className="text-lg text-paperbark mb-8">
              Subscribe to our journal for sustainable living tips, product care guides, 
              and stories from our artisan community
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-6 py-3 rounded-full text-deep-forest focus:outline-none focus:ring-2 focus:ring-vibrant-aqua"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="bg-vibrant-aqua text-deep-forest px-8 py-3 rounded-full font-medium hover:bg-white transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
