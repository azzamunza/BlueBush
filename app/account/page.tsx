'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, User, Heart, Settings, MapPin } from 'lucide-react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'preferences'>('orders');

  // Mock data
  const orders = [
    {
      id: 'BB123456',
      date: '2026-02-15',
      status: 'Delivered',
      total: 280.00,
      items: 3,
    },
    {
      id: 'BB123455',
      date: '2026-02-01',
      status: 'In Transit',
      total: 185.50,
      items: 2,
    },
    {
      id: 'BB123454',
      date: '2026-01-20',
      status: 'Delivered',
      total: 420.00,
      items: 5,
    },
  ];

  const tabs = [
    { key: 'orders', label: 'Order History', icon: Package },
    { key: 'profile', label: 'My Profile', icon: User },
    { key: 'preferences', label: 'Eco Preferences', icon: Heart },
  ];

  return (
    <main className="min-h-screen bg-paperbark py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-deep-forest mb-2">
            My Account
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back! Manage your orders, profile, and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-deep-forest text-white'
                        : 'text-deep-forest hover:bg-paperbark'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-deep-forest mb-6">
                  Order History
                </h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-soft-sandstone rounded-lg p-4 hover:border-emerald transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-deep-forest mb-1">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.date).toLocaleDateString('en-AU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-deep-forest">
                              ${order.total.toFixed(2)}
                            </p>
                            <span
                              className={`text-sm font-medium ${
                                order.status === 'Delivered'
                                  ? 'text-emerald'
                                  : 'text-vibrant-aqua'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <button className="px-4 py-2 border border-deep-forest text-deep-forest rounded-full hover:bg-deep-forest hover:text-white transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-deep-forest mb-6">
                  My Profile
                </h2>
                <form className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-deep-forest mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-deep-forest mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Alex"
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-deep-forest mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Johnson"
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-deep-forest mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue="alex.johnson@email.com"
                        className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-deep-forest mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue="0412 345 678"
                        className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-deep-forest mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Default Shipping Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-deep-forest mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          defaultValue="123 Green Street"
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-deep-forest mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            defaultValue="Melbourne"
                            className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-deep-forest mb-2">
                            State
                          </label>
                          <select className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none">
                            <option>VIC</option>
                            <option>NSW</option>
                            <option>QLD</option>
                            <option>SA</option>
                            <option>WA</option>
                            <option>TAS</option>
                            <option>NT</option>
                            <option>ACT</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-deep-forest mb-2">
                          Postcode
                        </label>
                        <input
                          type="text"
                          defaultValue="3000"
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto bg-deep-forest text-white px-8 py-4 rounded-full font-medium hover:bg-emerald transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </motion.div>
            )}

            {/* Eco Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-deep-forest mb-6">
                  Eco Preferences
                </h2>
                <p className="text-gray-600 mb-6">
                  Help us personalise your experience by sharing your sustainability priorities
                </p>

                <div className="space-y-6">
                  {/* Preference Categories */}
                  {[
                    {
                      title: 'Material Preferences',
                      options: ['Organic Cotton', 'Bamboo', 'Linen', 'Recycled Materials'],
                    },
                    {
                      title: 'Eco Certifications',
                      options: ['GOTS', 'OEKO-TEX', 'Fair Trade', 'Carbon Neutral'],
                    },
                    {
                      title: 'Product Priorities',
                      options: ['Biodegradable', 'Plastic-Free', 'Locally Made', 'Vegan'],
                    },
                  ].map((category) => (
                    <div key={category.title} className="border-b border-soft-sandstone pb-6 last:border-b-0">
                      <h3 className="font-semibold text-deep-forest mb-4">
                        {category.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {category.options.map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded border-soft-sandstone text-emerald focus:ring-emerald"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Newsletter */}
                  <div className="bg-paperbark rounded-lg p-6">
                    <h3 className="font-semibold text-deep-forest mb-2">
                      Sustainability Newsletter
                    </h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded border-soft-sandstone text-emerald focus:ring-emerald"
                      />
                      <span className="text-gray-700">
                        Send me tips and updates on sustainable living
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto bg-deep-forest text-white px-8 py-4 rounded-full font-medium hover:bg-emerald transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
