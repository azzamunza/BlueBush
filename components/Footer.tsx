import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-forest text-white mt-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-vibrant-aqua">About BlueBush</h3>
            <p className="text-paperbark text-sm leading-relaxed">
              Premium sustainable Australian homewares. Ethically sourced, beautifully crafted, 
              built to last.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-vibrant-aqua">Shop</h3>
            <ul className="space-y-2 text-paperbark text-sm">
              <li>
                <Link href="/shop?category=Bedroom" className="hover:text-vibrant-aqua transition-colors">
                  Bedroom
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Bathroom" className="hover:text-vibrant-aqua transition-colors">
                  Bathroom
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Dining" className="hover:text-vibrant-aqua transition-colors">
                  Dining
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Living" className="hover:text-vibrant-aqua transition-colors">
                  Living
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-vibrant-aqua">Customer Service</h3>
            <ul className="space-y-2 text-paperbark text-sm">
              <li>
                <Link href="/contact" className="hover:text-vibrant-aqua transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-vibrant-aqua transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-vibrant-aqua transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-vibrant-aqua transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-vibrant-aqua">Connect</h3>
            <ul className="space-y-2 text-paperbark text-sm">
              <li>
                <Link href="/our-story" className="hover:text-vibrant-aqua transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-vibrant-aqua transition-colors">
                  Journal
                </Link>
              </li>
              <li>
                <a href="mailto:hello@bluebush.com.au" className="hover:text-vibrant-aqua transition-colors">
                  hello@bluebush.com.au
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-soft-sandstone/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-paperbark text-sm">
              © {currentYear} BlueBush. Sustainable Homewares. Australian Grown.
            </p>
            <p className="text-soft-sandstone text-xs">
              WCAG 2.1 AA Compliant • Built with care for accessibility
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
