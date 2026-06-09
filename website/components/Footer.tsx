"use client";

import { useEffect, useRef } from "react";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      footer.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          footer.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col footer-col--brand">
            <div className="footer-brand">WILD WILD</div>
            <div className="footer-eyebrow">Defend The Habitat</div>
            <p className="footer-copy">
              Premium sustainable, genderless brand born from India&apos;s
              forests.
            </p>
          </div>

          <div className="footer-col footer-col--contact">
            <div className="footer-label">Contact</div>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <span className="footer-sublabel">General</span>
                <a className="footer-link" href="mailto:hello@thewildwild.in">
                  hello@thewildwild.in
                </a>
              </div>
              <div className="footer-contact-item">
                <span className="footer-sublabel">Help and Size Exchanges</span>
                <a className="footer-link" href="mailto:care@thewildwild.in">
                  care@thewildwild.in
                </a>
              </div>
            </div>
          </div>

          <div className="footer-col footer-col--conservation">
            <div className="footer-label">Conservation</div>
            <div className="footer-conservation-box">
              <div className="footer-stat">20%</div>
              <div className="footer-stat-copy">
                Of profits to Indian wildlife conservation.
              </div>
            </div>
          </div>
        </div>

        <div className="footer-rule" aria-hidden="true" />

        <div className="footer-bottom">
          <span className="footer-copyright">
            © 2026 Wild Wild — All Rights Reserved
          </span>
          <span className="footer-dot" aria-hidden="true">
            ·
          </span>
          <span className="footer-badges">
            GOTS Certified · OEKO-TEX · Sustainable · India
          </span>
        </div>
      </div>
    </footer>
  );
}
