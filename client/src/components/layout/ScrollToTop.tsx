/**
 * ScrollToTop Navigation Controller Component
 * 
 * In Single-Page Applications (React Router), navigating between routes preserves
 * the window scroll position by default. This component listens to route location
 * changes and automatically resets the scroll position to the top (0, 0).
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop: React.FC = () => {
  // Extract current URL pathname from React Router
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window immediately to the top left corner whenever pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  // Renders nothing visually; acts strictly as a route side-effect handler
  return null;
};
