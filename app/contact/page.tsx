'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Simulate form submission
      setTimeout(() => {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      }, 500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

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
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-paperbark">
              Have a question about our products or sustainability practices? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-deep-forest mb-6">
                Contact Information
              </h2>
              
              <div className="space-y-6">
                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald text-white rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep-forest mb-1">Email Us</h3>
                    <a
                      href="mailto:hello@bluebush.com.au"
                      className="text-gray-600 hover:text-emerald transition-colors"
                    >
                      hello@bluebush.com.au
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald text-white rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep-forest mb-1">Call Us</h3>
                    <a
                      href="tel:1300123456"
                      className="text-gray-600 hover:text-emerald transition-colors"
                    >
                      1300 123 456
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald text-white rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep-forest mb-1">Visit Our Showroom</h3>
                    <p className="text-gray-600">
                      123 Green Street<br />
                      Melbourne VIC 3000<br />
                      Australia
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald text-white rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep-forest mb-1">Opening Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9am - 6pm<br />
                      Saturday: 10am - 4pm<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FAQ Link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-paperbark rounded-lg p-6"
            >
              <h3 className="font-bold text-deep-forest mb-2">
                Looking for quick answers?
              </h3>
              <p className="text-gray-600 mb-4">
                Check out our FAQ page for information about shipping, returns, and product care.
              </p>
              <span className="text-emerald font-medium">
                FAQ page coming soon
              </span>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-soft-sandstone rounded-lg p-6 md:p-8"
            >
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald text-white rounded-full mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-bold text-deep-forest mb-4">
                    Message Sent!
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-deep-forest text-white px-6 py-3 rounded-full font-medium hover:bg-emerald transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-deep-forest mb-6">
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-deep-forest mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors ${
                          errors.name
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-soft-sandstone focus:border-emerald'
                        }`}
                        aria-label="Your name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-deep-forest mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors ${
                          errors.email
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-soft-sandstone focus:border-emerald'
                        }`}
                        aria-label="Email address"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone (Optional) */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-deep-forest mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        aria-label="Phone number"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-deep-forest mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors ${
                          errors.subject
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-soft-sandstone focus:border-emerald'
                        }`}
                        aria-label="Subject"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                      >
                        <option value="">Select a subject</option>
                        <option value="product">Product Enquiry</option>
                        <option value="order">Order Status</option>
                        <option value="wholesale">Wholesale Enquiry</option>
                        <option value="sustainability">Sustainability Question</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.subject && (
                        <p id="subject-error" className="mt-1 text-sm text-red-600">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-deep-forest mb-2">
                        Your Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors resize-none ${
                          errors.message
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-soft-sandstone focus:border-emerald'
                        }`}
                        aria-label="Your message"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && (
                        <p id="message-error" className="mt-1 text-sm text-red-600">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-deep-forest text-white px-8 py-4 rounded-full font-medium hover:bg-emerald transition-colors inline-flex items-center justify-center gap-2"
                    >
                      Send Message
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <section className="bg-paperbark py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="aspect-video bg-gradient-to-br from-soft-sandstone to-outback-ochre rounded-lg flex items-center justify-center text-gray-500 text-xl">
            Map Showing Showroom Location
          </div>
        </div>
      </section>
    </main>
  );
}
