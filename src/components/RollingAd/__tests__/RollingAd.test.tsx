import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RollingAd from '../index';

// Mock window.open
const mockOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

describe('RollingAd', () => {
  beforeEach(() => {
    mockOpen.mockClear();
  });

  it('renders the first ad text by default', () => {
    render(<RollingAd />);
    const adText = screen.getByText(/The Fastest ASGI Webframework/i);
    expect(adText).toBeInTheDocument();
  });

  it('applies correct CSS classes for clickable ads', () => {
    render(<RollingAd />);
    const adElement = screen.getByRole('button');
    expect(adElement).toHaveClass('adText');
    expect(adElement).toHaveClass('clickable');
  });

  it('opens link in new tab when ad is clicked', () => {
    render(<RollingAd />);
    const adElement = screen.getByRole('button');
    
    fireEvent.click(adElement);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/raceychan/lihil',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('handles keyboard navigation (Enter key)', () => {
    render(<RollingAd />);
    const adElement = screen.getByRole('button');
    
    fireEvent.keyDown(adElement, { key: 'Enter' });
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/raceychan/lihil',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('handles keyboard navigation (Space key)', () => {
    render(<RollingAd />);
    const adElement = screen.getByRole('button');
    
    fireEvent.keyDown(adElement, { key: ' ' });
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/raceychan/lihil',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('ignores other keyboard keys', () => {
    render(<RollingAd />);
    const adElement = screen.getByRole('button');
    
    fireEvent.keyDown(adElement, { key: 'a' });
    
    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('changes ad when animation iteration event is triggered', () => {
    render(<RollingAd />);
    
    // Initially shows first ad
    expect(screen.getByText(/The Fastest ASGI Webframework/i)).toBeInTheDocument();
    
    // Simulate animation iteration event
    const adElement = screen.getByRole('button');
    fireEvent.animationIteration(adElement);
    
    // Should now show second ad
    expect(screen.getByText(/Add API-Gateway Features/i)).toBeInTheDocument();
  });

  it('cycles through all ads correctly', () => {
    render(<RollingAd />);
    const getAdElement = () => screen.getByRole('button');
    
    // First ad
    expect(screen.getByText(/The Fastest ASGI Webframework/i)).toBeInTheDocument();
    
    // Second ad
    fireEvent.animationIteration(getAdElement());
    expect(screen.getByText(/Add API-Gateway Features/i)).toBeInTheDocument();
    
    // Third ad
    fireEvent.animationIteration(getAdElement());
    expect(screen.getByText(/Interactive, Automated Benchmarks/i)).toBeInTheDocument();
    
    // Cycles back to first ad
    fireEvent.animationIteration(getAdElement());
    expect(screen.getByText(/The Fastest ASGI Webframework/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<RollingAd />);
    const adElement = screen.getByRole('button');
    
    expect(adElement).toHaveAttribute('role', 'button');
    expect(adElement).toHaveAttribute('tabIndex', '0');
  });

  it('renders container with correct CSS class', () => {
    const { container } = render(<RollingAd />);
    const rollingAdContainer = container.firstChild;
    
    expect(rollingAdContainer).toHaveClass('rollingAd');
  });
});