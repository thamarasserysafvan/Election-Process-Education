"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Vote, MessageSquare, Target } from 'lucide-react';

const links = [
  { href: '/', label: 'Assistant', icon: MessageSquare },
  { href: '/quiz', label: 'Quiz Engine', icon: Target },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 border-b border-gray-200"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / brand */}
          <Link
            href="/"
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            aria-label="VoteAssist India — go to home"
          >
            <div className="bg-blue-600 p-2 rounded-lg text-white" aria-hidden="true">
              <Vote size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              VoteAssist India
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6" role="list">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="listitem"
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-blue-500'
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
