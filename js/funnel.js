(function () {
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;
  var progressBar = document.querySelector(".funnel-scroll-progress span");

  if (!body || reducedMotion) {
    if (body) {
      body.classList.add("funnel-reduced-motion");
    }
    return;
  }

  var selectors = [
    ".funnel-section__intro",
    ".funnel-hero-intake",
    ".funnel-trust-strip__grid > div",
    ".funnel-proof-head > *",
    ".funnel-proof-grid article",
    ".funnel-authority__grid > *",
    ".funnel-advisor-cards article",
    ".funnel-card",
    ".funnel-decision-grid > *",
    ".funnel-decision-list > div",
    ".funnel-fit-panel",
    ".funnel-scope-grid article",
    ".funnel-split > *",
    ".funnel-video-grid > *",
    ".funnel-media-card",
    ".funnel-apply-grid > *",
    ".funnel-after-grid > *",
    ".funnel-after-list > div",
    ".funnel-testimonials figure",
    ".funnel-process > div",
    ".funnel-thank-hero__grid > *",
    ".funnel-outcome-hero__copy",
    ".funnel-outcome-panel",
    ".funnel-booking-card",
    ".funnel-next-grid article",
    ".funnel-outcome-split > *",
    ".funnel-outcome-card",
    ".funnel-qualified-booking__header",
    ".funnel-calendar-shell--booking",
    ".funnel-qualified-booking__actions",
    ".funnel-thank-steps article",
    ".funnel-thank-split > *",
    ".funnel-thank-list > div",
    ".funnel-thank-outcomes > div",
    ".funnel-faq-grid > *",
    ".funnel-final-cta .funnel-container",
    ".funnel-disclaimer .funnel-container",
    ".funnel-footer__grid > *"
  ];

  var revealItems = Array.prototype.slice.call(document.querySelectorAll(selectors.join(",")));
  var uniqueItems = revealItems.filter(function (item, index) {
    return revealItems.indexOf(item) === index;
  });

  uniqueItems.forEach(function (item, index) {
    item.classList.add("funnel-reveal");
    item.style.setProperty("--reveal-delay", Math.min(index % 4, 3) * 80 + "ms");
  });

  var revealVariants = [
    {
      selector: ".funnel-decision-grid > :first-child, .funnel-split > :first-child, .funnel-video-grid > :first-child, .funnel-apply-grid > :first-child, .funnel-after-grid > :first-child, .funnel-faq-grid > :first-child, .funnel-thank-hero__grid > :first-child, .funnel-outcome-grid > :first-child, .funnel-booking-layout > :first-child",
      name: "left"
    },
    {
      selector: ".funnel-decision-grid > :last-child, .funnel-split > :last-child, .funnel-video-grid > :last-child, .funnel-apply-grid > :last-child, .funnel-after-grid > :last-child, .funnel-faq-grid > :last-child, .funnel-thank-hero__grid > :last-child, .funnel-outcome-grid > :last-child, .funnel-booking-layout > :last-child",
      name: "right"
    },
    {
      selector: ".funnel-card, .funnel-proof-grid article, .funnel-scope-grid article, .funnel-advisor-cards article, .funnel-testimonials figure, .funnel-process > div",
      name: "scale"
    },
    {
      selector: ".funnel-risk-list > div, .funnel-decision-list > div, .funnel-after-list > div",
      name: "rise"
    }
  ];

  uniqueItems.forEach(function (item) {
    revealVariants.some(function (variant) {
      if (item.matches && item.matches(variant.selector)) {
        item.setAttribute("data-reveal-variant", variant.name);
        return true;
      }

      return false;
    });
  });

  var priorityItems = document.querySelectorAll(".funnel-form-shell, .funnel-final-cta .funnel-container");
  Array.prototype.forEach.call(priorityItems, function (item) {
    item.setAttribute("data-reveal-group", "priority");
  });

  var updatePageMotionState = function () {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
    var mobileCtaThreshold = Math.max(280, window.innerHeight * 0.44);

    body.classList.toggle("funnel-has-scrolled", scrollTop > 12);
    body.classList.toggle("funnel-show-mobile-cta", scrollTop > mobileCtaThreshold);

    if (progressBar) {
      progressBar.style.setProperty("--funnel-scroll-progress", progress.toFixed(4));
    }
  };

  window.requestAnimationFrame(function () {
    body.classList.add("funnel-motion-ready");
    updatePageMotionState();
  });

  window.addEventListener("scroll", updatePageMotionState, { passive: true });
  window.addEventListener("resize", updatePageMotionState);

  if (!("IntersectionObserver" in window)) {
    uniqueItems.forEach(function (item) {
      item.classList.add("funnel-reveal--visible");
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("funnel-reveal--visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.12
  });

  uniqueItems.forEach(function (item) {
    observer.observe(item);
  });
})();

(function () {
  var bookingTarget = document.getElementById("booking-calendar");
  var bookingLinks = document.querySelectorAll('a[href="#booking-calendar"]');

  if (!bookingTarget || !bookingLinks.length) {
    return;
  }

  Array.prototype.forEach.call(bookingLinks, function (link) {
    link.addEventListener("click", function (event) {
      var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      event.preventDefault();
      bookingTarget.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });

      if (window.history && window.history.pushState) {
        window.history.pushState(null, "", "#booking-calendar");
      } else {
        window.location.hash = "booking-calendar";
      }
    });
  });
})();

(function () {
  var formFrame = document.getElementById("inline-cpYvPsitFjJtbRB8PRNI");
  var formLoader = document.querySelector("[data-form-loader]");

  if (!formFrame || !formLoader) {
    return;
  }

  var formShell = formFrame.closest ? formFrame.closest(".funnel-form-shell") : null;
  var hasLoaded = false;

  if (formShell) {
    formShell.setAttribute("aria-busy", "true");
  }

  var markFormLoaded = function () {
    if (hasLoaded) {
      return;
    }

    hasLoaded = true;
    formLoader.classList.add("funnel-form-loader--hidden");

    if (formShell) {
      formShell.classList.add("funnel-form-shell--loaded");
      formShell.setAttribute("aria-busy", "false");
    }

    window.setTimeout(function () {
      formLoader.setAttribute("hidden", "");
    }, 320);
  };

  formFrame.addEventListener("load", markFormLoaded);

  window.setTimeout(function () {
    if (!hasLoaded) {
      formLoader.classList.add("funnel-form-loader--slow");
    }
  }, 8000);
})();
