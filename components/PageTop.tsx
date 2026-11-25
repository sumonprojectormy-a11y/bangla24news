'use client';

import { useEffect, useState } from 'react';

export default function PageTop() {
  const [visible, show] = useState(false);
  useEffect(() => {
    const update = () => show(window.scrollY > 400);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return visible && <a className="page-top" href="#page-top" onClick={event => {
    event.preventDefault();
    document.getElementById('page-top')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }}><span aria-hidden="true">↑</span> পাতার শুরুতে ফিরুন</a>;
}
