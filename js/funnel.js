(function () {
  var motionPreference = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reducedMotion = motionPreference && motionPreference.matches;
  var body = document.body;
  var progressBar = document.querySelector(".funnel-scroll-progress span");
  var heroVideo = document.querySelector(".funnel-hero__video");
  var mobileCtaQuietZones = document.querySelectorAll(
    ".funnel-authority, .funnel-partner-interlude, #apply, .funnel-section--after-apply, .funnel-section--faq, .funnel-final-cta, .funnel-footer"
  );

  if (heroVideo) {
    var revealHeroVideo = function () {
      if (heroVideo.readyState < 2) {
        return;
      }

      heroVideo.classList.add("funnel-hero__video--ready");
      if (body) {
        body.classList.add("funnel-hero-video-ready");
      }
    };

    heroVideo.addEventListener("loadeddata", revealHeroVideo, { once: true });
    heroVideo.addEventListener("canplay", revealHeroVideo, { once: true });
    heroVideo.addEventListener("playing", revealHeroVideo, { once: true });

    if (heroVideo.readyState >= 2) {
      window.requestAnimationFrame(revealHeroVideo);
    }
  }

  if (motionPreference && heroVideo) {
    var syncHeroVideo = function (event) {
      var shouldReduce = event ? event.matches : motionPreference.matches;

      if (shouldReduce) {
        heroVideo.pause();
        return;
      }

      if (heroVideo.autoplay) {
        var playRequest = heroVideo.play();
        if (playRequest && typeof playRequest.catch === "function") {
          playRequest.catch(function () {});
        }
      }
    };

    syncHeroVideo();
    if (typeof motionPreference.addEventListener === "function") {
      motionPreference.addEventListener("change", syncHeroVideo);
    } else if (typeof motionPreference.addListener === "function") {
      motionPreference.addListener(syncHeroVideo);
    }
  }

  if (!body || reducedMotion) {
    if (body) {
      body.classList.add("funnel-reduced-motion");
    }
    return;
  }

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      body.classList.add("srg-prototype-ready");
    });
  });

  var selectors = [
    ".funnel-section__intro",
    ".funnel-hero-intake",
    ".funnel-trust-strip__grid > div",
    ".funnel-proof-head > *",
    ".funnel-proof-grid article",
    ".funnel-authority__grid > *",
    ".funnel-advisor-cards article",
    ".funnel-partner-interlude",
    ".funnel-review-orbit",
    ".funnel-review-map",
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
      selector: ".funnel-card, .funnel-proof-grid article, .funnel-scope-grid article, .funnel-advisor-cards article, .funnel-partner-interlude, .funnel-testimonials figure, .funnel-process > div",
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
    var mobileCtaSuppressed = Array.prototype.some.call(mobileCtaQuietZones, function (zone) {
      var bounds = zone.getBoundingClientRect();
      return bounds.top < window.innerHeight - 90 && bounds.bottom > 110;
    });

    body.classList.toggle("funnel-has-scrolled", scrollTop > 12);
    body.classList.toggle("funnel-mobile-cta-suppressed", mobileCtaSuppressed);
    body.classList.toggle("funnel-show-mobile-cta", scrollTop > mobileCtaThreshold && !mobileCtaSuppressed);

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
  var formFrame = document.querySelector("[data-srg-form-frame]");
  var formLoader = document.querySelector("[data-form-loader]");

  if (!formFrame || !formLoader) {
    return;
  }

  var formShell = formFrame.closest ? formFrame.closest(".funnel-form-shell") : null;
  var hasLoaded = false;

  var parseHeight = function (payload) {
    var value = payload;
    if (typeof value === "string") {
      try { value = JSON.parse(value); }
      catch (error) {
        var match = value.match(/(?:height|iframeHeight)[^0-9]{0,12}([0-9]{3,4})/i);
        return match ? Number(match[1]) : null;
      }
    }
    if (!value || typeof value !== "object") return null;
    var keys = Object.keys(value);
    for (var i = 0; i < keys.length; i += 1) {
      if (/height/i.test(keys[i]) && isFinite(Number(value[keys[i]]))) return Number(value[keys[i]]);
    }
    return null;
  };

  window.addEventListener("message", function (event) {
    if (!/leadconnectorhq\.com|msgsndr\.com/.test(event.origin || "")) return;
    var height = parseHeight(event.data);
    if (!height) return;
    height = Math.max(590, Math.min(1200, Math.round(height + 8)));
    formFrame.style.height = height + "px";
    formFrame.setAttribute("data-height", String(height));
  });
  var scrollingObserver = null;

  var preventNestedScrolling = function () {
    if (formFrame.getAttribute("scrolling") !== "no") {
      formFrame.setAttribute("scrolling", "no");
    }
  };

  if (formShell) {
    formShell.setAttribute("aria-busy", "true");
  }

  preventNestedScrolling();

  if (window.MutationObserver) {
    scrollingObserver = new MutationObserver(preventNestedScrolling);
    scrollingObserver.observe(formFrame, {
      attributes: true,
      attributeFilter: ["scrolling"]
    });
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

  if (document.readyState === "complete") {
    markFormLoaded();
  } else {
    window.addEventListener("load", markFormLoaded, { once: true });
  }

  window.setTimeout(function () {
    if (!hasLoaded) {
      formLoader.classList.add("funnel-form-loader--slow");
    }
  }, 8000);
})();

(function () {
  var modal = document.querySelector("[data-bio-modal]");
  var triggers = document.querySelectorAll("[data-bio-trigger]");

  if (!modal || !triggers.length) {
    return;
  }

  var dialog = modal.querySelector(".funnel-bio-modal__dialog");
  var image = modal.querySelector("[data-bio-modal-image]");
  var name = modal.querySelector("[data-bio-modal-name]");
  var role = modal.querySelector("[data-bio-modal-role]");
  var copy = modal.querySelector("[data-bio-modal-copy]");
  var closeControls = modal.querySelectorAll("[data-bio-close]");
  var lastTrigger = null;

  var openModal = function (trigger) {
    lastTrigger = trigger;

    if (image) {
      image.src = trigger.getAttribute("data-bio-image") || "";
      image.alt = trigger.getAttribute("data-bio-alt") || "";
    }

    if (name) {
      name.textContent = trigger.getAttribute("data-bio-name") || "SRG Advisors Partner";
    }

    if (role) {
      role.textContent = trigger.getAttribute("data-bio-role") || "CPA, Partner";
    }

    if (copy) {
      copy.textContent = trigger.getAttribute("data-bio-text") || "";
    }

    modal.hidden = false;
    document.body.classList.add("funnel-bio-modal-open");

    window.requestAnimationFrame(function () {
      if (dialog) {
        dialog.focus();
      }
    });
  };

  var closeModal = function () {
    modal.hidden = true;
    document.body.classList.remove("funnel-bio-modal-open");

    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
  };

  Array.prototype.forEach.call(triggers, function (trigger) {
    trigger.addEventListener("click", function () {
      openModal(trigger);
    });
  });

  var openBioFromHash = function () {
    var hash = window.location.hash || "";
    if (!/^#bio-(jay|leon|joshua|heather)$/.test(hash)) {
      return;
    }

    var card = document.querySelector(hash);
    var trigger = card ? card.querySelector("[data-bio-trigger]") : null;
    if (!trigger) {
      return;
    }

    window.setTimeout(function () {
      openModal(trigger);
    }, 120);
  };

  openBioFromHash();
  window.addEventListener("hashchange", openBioFromHash);

  Array.prototype.forEach.call(closeControls, function (control) {
    control.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (event) {
    if (modal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key === "Tab" && dialog) {
      var focusable = dialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();
