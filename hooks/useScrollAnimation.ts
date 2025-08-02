
import { useEffect } from 'react';

/**
 * A custom hook to apply scroll-triggered animations.
 * It uses IntersectionObserver to add a 'visible' class to elements
 * with the '.scroll-animate' class when they enter the viewport.
 *
 * @param dependencies - An array of dependencies. The hook will re-run
 * the animation setup whenever any of these dependencies change. This is
 * crucial for pages where content is loaded or filtered dynamically.
 */
export const useScrollAnimation = (dependencies: any[] = []) => {
  useEffect(() => {
    // Set up the IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve the element after it has become visible to improve performance.
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    // A small delay to ensure all elements are in the DOM before observing.
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach((el) => {
        // Only observe elements that are not yet visible to avoid re-triggering.
        if (!el.classList.contains('visible')) {
          observer.observe(el);
        }
      });
    }, 50); // 50ms delay

    // Cleanup function to disconnect the observer when the component unmounts
    // or when the dependencies change.
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies); // The effect re-runs only when the dependencies array changes.
};
