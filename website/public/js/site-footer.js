(function () {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/css/site-footer.css";
  document.head.appendChild(link);

  var footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML =
    '<div class="footer-inner">' +
    '<div class="footer-grid">' +
    '<div class="footer-col footer-col--brand">' +
    '<div class="footer-brand">WILD WILD</div>' +
    '<div class="footer-eyebrow">Defend The Habitat</div>' +
    '<p class="footer-copy">Premium sustainable, genderless brand born from India\'s forests.</p>' +
    "</div>" +
    '<div class="footer-col footer-col--contact">' +
    '<div class="footer-label">Contact</div>' +
    '<div class="footer-contact-list">' +
    '<div class="footer-contact-item"><span class="footer-sublabel">General</span>' +
    '<a class="footer-link" href="mailto:hello@thewildwild.in">hello@thewildwild.in</a></div>' +
    '<div class="footer-contact-item"><span class="footer-sublabel">Help and Size Exchanges</span>' +
    '<a class="footer-link" href="mailto:care@thewildwild.in">care@thewildwild.in</a></div>' +
    "</div></div>" +
    '<div class="footer-col footer-col--conservation">' +
    '<div class="footer-label">Conservation</div>' +
    '<div class="footer-conservation-box"><div class="footer-stat">20%</div>' +
    '<div class="footer-stat-copy">Of profits to Indian wildlife conservation.</div></div>' +
    "</div></div>" +
    '<div class="footer-rule" aria-hidden="true"></div>' +
    '<div class="footer-bottom">' +
    '<span class="footer-copyright">© 2026 Wild Wild — All Rights Reserved</span>' +
    '<span class="footer-dot" aria-hidden="true">·</span>' +
    '<span class="footer-badges">GOTS Certified · OEKO-TEX · Sustainable · India</span>' +
    "</div></div>";

  document.body.appendChild(footer);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    footer.classList.add("is-visible");
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          footer.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(footer);
  }
})();
