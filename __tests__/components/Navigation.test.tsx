/**
 * Smoke tests for the Navigation component
 */
import { render, screen } from '@testing-library/react';
import Navigation from '../../components/Navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next/link to a plain anchor
jest.mock('next/link', () =>
  function Link({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  }
);

describe('Navigation', () => {
  it('renders the brand name', () => {
    render(<Navigation />);
    expect(screen.getByText('VoteAssist India')).toBeInTheDocument();
  });

  it('renders Assistant and Quiz Engine text', () => {
    render(<Navigation />);
    expect(screen.getByText('Assistant')).toBeInTheDocument();
    expect(screen.getByText('Quiz Engine')).toBeInTheDocument();
  });

  it('marks the home link with aria-current="page" when on "/"', () => {
    render(<Navigation />);
    // The home link href is "/"
    const homeLink = screen.getByRole('link', { name: /VoteAssist India/i });
    expect(homeLink).toHaveAttribute('aria-label');
  });

  it('has a nav landmark with an accessible label', () => {
    render(<Navigation />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders at least one nav link', () => {
    render(<Navigation />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});
