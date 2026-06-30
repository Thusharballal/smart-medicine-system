import React from 'react'
import { Link } from 'react-router-dom'
import { RiExternalLinkLine, RiHeartFill } from 'react-icons/ri'
import { PMBJPWordmark, PMBJPBadge } from '../brand/PMBJPLogo'

const navLinks = [
  { label: 'About',           to: '/about'   },
  { label: 'Contact',         to: '/contact' },
  { label: 'Privacy Policy',  to: '/privacy' },
  { label: 'Terms of Service',to: '/terms'   },
]

const helpLinks = [
  { label: 'Search Medicines',     to: '/medicines'        },
  { label: 'Find Pharmacy',        to: '/pharmacy-locator' },
  { label: 'Jan Aushadhi Guide',   to: '/about'            },
  { label: 'FAQs',                 to: '/faqs'             },
]

export default function Footer({ className = '' }) {
  return (
    <footer
      className={[
        'mt-auto border-t border-gray-200/60 dark:border-gray-800/60',
        'bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm',
        className,
      ].join(' ')}
      aria-label="Site footer"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
              aria-label="Jan Aushadhi Smart Medicine – Home"
            >
              <PMBJPWordmark size={38} theme="color" showSubtitle />
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-4">
              Helping citizens access affordable generic medicines under the
              <strong className="text-gray-700 dark:text-gray-300"> Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)</strong> scheme.
            </p>

            <div className="flex flex-col gap-2.5">
              <PMBJPBadge />
              <a
                href="https://janaushadhi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit official PMBJP website (opens in new tab)"
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-500 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 rounded"
              >
                <RiExternalLinkLine size={14} aria-hidden="true" />
                janaushadhi.gov.in — Official Website
              </a>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                Dept. of Pharmaceuticals · Ministry of Chemicals &amp; Fertilizers · Govt. of India
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {helpLinks.map(l => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">Company</h3>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map(l => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} JanAushadhi Smart Medicine. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            Built with <RiHeartFill size={11} className="text-danger-400" aria-hidden="true" /> as a Final Year Engineering Project.
          </p>
        </div>
      </div>
    </footer>
  )
}
