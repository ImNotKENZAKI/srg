(function () {
  "use strict";

  var path = (window.location.pathname || "").toLowerCase();
  var fileName = path.split("/").pop() || "";
  var stage = "short_funnel";
  var sent = {};

  if (fileName.indexOf("strategy-consultation-qualified-booking") !== -1) {
    stage = "manual_booking";
  } else if (fileName.indexOf("strategy-consultation-thank-you") !== -1) {
    stage = "review_received";
  } else if (fileName.indexOf("private-strategy-review") !== -1) {
    stage = "step_2_review";
  } else if (fileName.indexOf("strategy-consultation") !== -1) {
    stage = "long_nurture";
  }

  var dispatch = function (name, detail, onceKey) {
    var key = onceKey || "";
    var payload;

    if (key && sent[key]) {
      return;
    }

    if (key) {
      sent[key] = true;
    }

    payload = {
      event: name,
      srg_stage: stage,
      srg_page: fileName || "tax-advisory-review.html",
      srg_event_version: "1.0"
    };

    Object.keys(detail || {}).forEach(function (property) {
      if (["srg_action", "srg_target", "srg_form_id"].indexOf(property) !== -1) {
        payload[property] = String(detail[property]).slice(0, 80);
      }
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    document.documentElement.setAttribute("data-srg-last-event", name);
    if (name.indexOf("_click") !== -1 || name === "srg_partner_bio_open") {
      document.documentElement.setAttribute("data-srg-last-action", name);
    }

    try {
      document.dispatchEvent(new CustomEvent("srg:conversion", { detail: payload }));
    } catch (error) {
      var event = document.createEvent("CustomEvent");
      event.initCustomEvent("srg:conversion", false, false, payload);
      document.dispatchEvent(event);
    }
  };

  window.srgTrackConversion = dispatch;
  document.documentElement.setAttribute("data-srg-event-layer", "ready");
  document.documentElement.setAttribute("data-srg-funnel-stage", stage);
  dispatch("srg_funnel_stage_view", {}, "stage-view");

  if (stage === "step_2_review") {
    dispatch("srg_step_2_view", {}, "step-2-view");
  } else if (stage === "review_received") {
    dispatch("srg_review_received", {}, "review-received");
  } else if (stage === "manual_booking") {
    dispatch("srg_manual_booking_view", {}, "manual-booking-view");
  }

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a, button") : null;
    var href;
    var target = "page_action";

    if (!link) {
      return;
    }

    href = link.getAttribute("href") || "";

    if (href.indexOf("tel:") === 0) {
      dispatch("srg_phone_click", { srg_action: "call", srg_target: "srg_phone" });
      return;
    }

    if (href === "#apply" || href.indexOf("tax-advisory-review") !== -1) {
      target = "step_1_form";
    } else if (href.indexOf("private-strategy-review") !== -1) {
      target = "step_2_review";
    } else if (href.indexOf("qualified-booking") !== -1) {
      target = "manual_booking";
    }

    if (link.matches("[data-bio-trigger]")) {
      dispatch("srg_partner_bio_open", { srg_action: "open_bio", srg_target: "partner_profile" });
    } else if (link.matches(".funnel-btn, .short-btn, .hero__cta, .review-btn, .thank-btn, .booking-btn") || target !== "page_action") {
      dispatch("srg_cta_click", { srg_action: "continue", srg_target: target });
    }
  });

  var frames = document.querySelectorAll("iframe[data-srg-form-frame], iframe[data-form-id]");

  Array.prototype.forEach.call(frames, function (frame, index) {
    var formId = frame.getAttribute("data-form-id") || "embedded_form";
    var shell = frame.closest("section, main") || frame;

    dispatch("srg_form_present", { srg_form_id: formId }, "form-present-" + index);

    frame.addEventListener("load", function () {
      dispatch("srg_form_loaded", { srg_form_id: formId }, "form-loaded-" + index);
    });

    frame.addEventListener("focus", function () {
      dispatch("srg_form_engaged", { srg_form_id: formId }, "form-engaged-" + index);
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            dispatch("srg_form_view", { srg_form_id: formId }, "form-view-" + index);
            observer.disconnect();
          }
        });
      }, { threshold: 0.28 });

      observer.observe(shell);
    }
  });
})();
