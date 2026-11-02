(function () {
  "use strict";

  /* Page hits: public beacon to Jake's Mini (no secret in the page).
   * Logs path + source fields. Mini WhatsApps Jake only for home=1.
   * Easy to disable: remove this block or return 204 from /site-hit.
   */
  /* Query string for the beacon, with private values (activation token) removed. */
  function landingQuery() {
    var q = new URLSearchParams(window.location.search || "");
    if (q.has("token")) q.set("token", "x");
    var out = q.toString();
    return out ? "?" + out : "";
  }

  (function trackHit() {
    var endpoint = "https://jakes-mac-mini2.tail98d8ce.ts.net/site-hit";
    var path = window.location.pathname || "/";
    var home = path === "/" || path === "/index.html";
    var params = new URLSearchParams(window.location.search || "");
    var ref = document.referrer || "";
    var utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    var parts = [
      "path=" + encodeURIComponent(path),
      "home=" + (home ? "1" : "0"),
      "ref=" + encodeURIComponent(ref.slice(0, 500)),
      "lang=" + encodeURIComponent((navigator.language || "").slice(0, 32)),
      "landing=" + encodeURIComponent(landingQuery().slice(0, 300)),
      "t=" + Date.now()
    ];
    utmKeys.forEach(function (k) {
      var v = (params.get(k) || "").trim();
      if (v) parts.push(k + "=" + encodeURIComponent(v.slice(0, 120)));
    });
    try {
      var img = new Image();
      img.referrerPolicy = "no-referrer";
      img.src = endpoint + "?" + parts.join("&");
    } catch (e) { /* ignore */ }
  })();

  /* Mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* Contribution / improvement forms */
  function setStatus(el, message, isError) {
    if (!el) return;
    el.hidden = false;
    el.textContent = message;
    el.classList.toggle("is-error", !!isError);
  }

  function clearFieldErrors(form) {
    form.querySelectorAll(".field-error").forEach(function (n) { n.remove(); });
    form.querySelectorAll("[aria-invalid]").forEach(function (n) {
      n.removeAttribute("aria-invalid");
    });
  }

  function requireFields(form, names) {
    clearFieldErrors(form);
    var ok = true;
    names.forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      var value = (field.value || "").trim();
      if (!value) {
        ok = false;
        field.setAttribute("aria-invalid", "true");
        var err = document.createElement("div");
        err.className = "field-error";
        err.textContent = "This field is required.";
        field.parentNode.appendChild(err);
      }
    });
    return ok;
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    var banner = document.createElement("div");
    banner.className = "note-box";
    banner.setAttribute("role", "status");
    banner.textContent = "Thanks. Your message was sent to info@sharedabundance.world.";
    var main = document.getElementById("main");
    if (main && main.firstElementChild) {
      main.insertBefore(banner, main.firstElementChild.nextSibling);
    }
  }

  var typeParam = params.get("type");
  if (typeParam) {
    var contribArea = document.getElementById("contrib-area");
    var proposalType = document.getElementById("proposal-type");
    var map = {
      "business-idea": { contrib: "Business ideas and customer research", proposal: "Business idea" },
      "rule-improvement": { contrib: "Legal and operating setup", proposal: "Rule improvement" },
      "economic-model": { contrib: "Money model", proposal: "Economic model" },
      "safeguard": { contrib: "Legal and operating setup", proposal: "Operational safeguard" }
    };
    var mapped = map[typeParam];
    if (mapped) {
      if (contribArea) contribArea.value = mapped.contrib;
      if (proposalType) proposalType.value = mapped.proposal;
      var target = document.getElementById("proposal-form");
      if (target && typeParam.indexOf("rule") === 0) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  var contribForm = document.getElementById("contribution-form");
  if (contribForm) {
    var contribStatus = document.getElementById("contrib-status");
    contribForm.addEventListener("submit", function (e) {
      if (!requireFields(contribForm, ["email", "area", "title", "offer"])) {
        e.preventDefault();
        setStatus(contribStatus, "Please complete the required fields before sending.", true);
        return;
      }
      var subj = contribForm.querySelector('input[name="_subject"]');
      if (subj) subj.value = "Shared Abundance · Contribution: " + contribForm.title.value.trim();
      setStatus(contribStatus, "Sending…", false);
    });
  }

  var proposalForm = document.getElementById("proposal-form-el");
  if (proposalForm) {
    var proposalStatus = document.getElementById("proposal-status");
    var preview = document.getElementById("proposal-preview");

    function buildProposalText() {
      return [
        "Improvement type: " + proposalForm.type.value.trim(),
        "Title: " + proposalForm.title.value.trim(),
        "",
        "Problem:",
        proposalForm.problem.value.trim(),
        "",
        "Suggested change:",
        proposalForm.change.value.trim(),
        "",
        "Expected benefit:",
        proposalForm.benefit.value.trim(),
        "",
        "Trade-offs / open questions:",
        (proposalForm.tradeoffs.value || "").trim() || "(not provided)"
      ].join("\n");
    }

    var previewBtn = document.getElementById("proposal-preview-btn");
    if (previewBtn) {
      previewBtn.addEventListener("click", function () {
        if (!requireFields(proposalForm, ["email", "type", "title", "problem", "change", "benefit"])) {
          setStatus(proposalStatus, "Please complete the required fields before previewing.", true);
          return;
        }
        preview.hidden = false;
        preview.textContent = buildProposalText();
        setStatus(proposalStatus, "Preview ready below.", false);
      });
    }

    proposalForm.addEventListener("submit", function (e) {
      if (!requireFields(proposalForm, ["email", "type", "title", "problem", "change", "benefit"])) {
        e.preventDefault();
        setStatus(proposalStatus, "Please complete the required fields before sending.", true);
        return;
      }
      var subj = proposalForm.querySelector('input[name="_subject"]');
      if (subj) subj.value = "Shared Abundance · Improvement: " + proposalForm.title.value.trim();
      setStatus(proposalStatus, "Sending…", false);
    });
  }
  /* Join flow (needs the join backend on Jake's Mini) */
  var JOIN_API = "https://jakes-mac-mini2.tail98d8ce.ts.net/join";
  var JOIN_HELP = " If it keeps happening, email info@sharedabundance.world and we will help.";

  function markInvalid(field, message) {
    field.setAttribute("aria-invalid", "true");
    var err = document.createElement("div");
    err.className = "field-error";
    err.textContent = message;
    var host = field.type === "checkbox" ? field.closest("label") : field.parentNode;
    if (host) host.appendChild(err);
  }

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isMobile(v) {
    var digits = v.replace(/[\s()\-.]/g, "");
    return /^\+?[0-9]{8,15}$/.test(digits);
  }
  function cleanMobile(v) {
    return v.replace(/[\s()\-.]/g, "");
  }

  function postJSON(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok || data.ok === false) {
          var e = new Error("request failed");
          e.data = data;
          throw e;
        }
        return data;
      });
    });
  }

  function errorText(err, fallback) {
    var msg = err && err.data && typeof err.data.error === "string" ? err.data.error : "";
    return (msg || fallback) + JOIN_HELP;
  }

  /* /join/ signup */
  var joinForm = document.getElementById("join-form");
  if (joinForm) {
    var joinStatus = document.getElementById("join-status");
    var refCode = (params.get("ref") || "").trim().replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
    if (refCode) {
      joinForm.elements.ref.value = refCode;
      var refField = document.getElementById("join-ref-field");
      var refNote = document.getElementById("join-ref-note");
      if (refField) refField.hidden = false;
      if (refNote) refNote.hidden = false;
    }

    joinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = requireFields(joinForm, ["name", "email", "mobile", "country"]);
      var f = joinForm.elements;
      var email = f.email.value.trim();
      var mobile = f.mobile.value.trim();
      if (email && !isEmail(email)) { ok = false; markInvalid(f.email, "Please enter a valid email address."); }
      if (mobile && !isMobile(mobile)) { ok = false; markInvalid(f.mobile, "Please include your country code, for example +27 82 123 4567."); }
      if (!f.agree_rules.checked) { ok = false; markInvalid(f.agree_rules, "Please agree to the project rules to join."); }
      if (!ok) {
        setStatus(joinStatus, "Please check the highlighted fields.", true);
        return;
      }
      if (f.website.value) { /* honeypot: pretend success */
        setStatus(joinStatus, "Check your email. Click the link we sent to activate your account.", false);
        return;
      }
      var payload = {
        name: f.name.value.trim(),
        email: email,
        mobile: cleanMobile(mobile),
        country: f.country.value.trim(),
        city: f.city.value.trim(),
        ref: f.ref.value.trim(),
        agree_rules: true,
        whatsapp_ok: !!f.whatsapp_ok.checked,
        website: f.website.value,
        utm_source: (params.get("utm_source") || "").slice(0, 120),
        utm_medium: (params.get("utm_medium") || "").slice(0, 120),
        utm_campaign: (params.get("utm_campaign") || "").slice(0, 120)
      };
      var btn = joinForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      setStatus(joinStatus, "Sending…", false);
      postJSON(JOIN_API + "/signup", payload).then(function () {
        joinForm.querySelector(".form-grid").hidden = true;
        setStatus(joinStatus, "Check your email. Click the link we sent to activate your account.", false);
      }).catch(function (err) {
        if (btn) btn.disabled = false;
        setStatus(joinStatus, errorText(err, "Sorry, we could not sign you up just now. Please try again in a few minutes."), true);
      });
    });
  }

  /* /join/invite/ after email activation */
  var referralForm = document.getElementById("referral-form");
  if (referralForm) {
    var token = (params.get("token") || "").trim();
    var referralStatus = document.getElementById("referral-status");
    var statusBox = document.getElementById("member-status");

    if (!token) {
      var missing = document.getElementById("token-missing");
      if (missing) missing.hidden = false;
      referralForm.hidden = true;
    } else {
      loadStatus();
    }

    function loadStatus() {
      fetch(JOIN_API + "/status?token=" + encodeURIComponent(token), { headers: { Accept: "application/json" } })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (data) { if (data && data.ok) showStatus(data); })
        .catch(function () { /* backend not reachable: keep the form */ });
    }

    function showStatus(data) {
      if (!statusBox) return;
      var title = document.getElementById("invite-title");
      if (title && data.name) title.textContent = "Welcome, " + String(data.name).split(" ")[0];
      var list = document.getElementById("status-list");
      var summary = document.getElementById("status-summary");
      var refs = Array.isArray(data.referrals) ? data.referrals : [];
      var joined = refs.filter(function (r) { return r && r.joined; }).length;
      if (summary) {
        if (data.active) summary.textContent = "Your membership is active. Thank you for helping it grow.";
        else if (refs.length) summary.textContent = joined + " of 2 people you invited have joined. Your membership becomes active when both have joined.";
        else summary.textContent = "You have not invited anyone yet. Add two people below.";
      }
      if (list) {
        list.innerHTML = "";
        refs.slice(0, 2).forEach(function (r, i) {
          var li = document.createElement("li");
          li.className = "milestone";
          var div = document.createElement("div");
          var h = document.createElement("h3");
          h.textContent = "Invite " + (i + 1) + (r.name ? ": " + r.name : "");
          div.appendChild(h);
          var pill = document.createElement("span");
          pill.className = "status-pill";
          pill.setAttribute("data-status", r.joined ? "joined" : "waiting");
          pill.textContent = r.joined ? "Joined" : "Waiting";
          li.appendChild(div);
          li.appendChild(pill);
          list.appendChild(li);
        });
      }
      if (data.code) {
        var linkBox = document.getElementById("invite-link-box");
        var linkInput = document.getElementById("invite-link");
        var code = String(data.code).replace(/[^A-Za-z0-9_-]/g, "");
        if (linkBox && linkInput && code) {
          linkInput.value = "https://sharedabundance.world/join/?ref=" + code;
          linkBox.hidden = false;
        }
      }
      statusBox.hidden = false;
      if (refs.length >= 2 || data.active) {
        var section = document.getElementById("referral-section");
        if (section) section.hidden = true;
      }
    }

    var copyBtn = document.getElementById("invite-link-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var input = document.getElementById("invite-link");
        var copyStatus = document.getElementById("invite-link-status");
        if (!input || !input.value) return;
        var done = function () { setStatus(copyStatus, "Link copied.", false); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(input.value).then(done, function () {
            input.select(); document.execCommand("copy"); done();
          });
        } else {
          input.select(); document.execCommand("copy"); done();
        }
      });
    }

    referralForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var names = ["r1_name", "r1_email", "r1_mobile", "r2_name", "r2_email", "r2_mobile"];
      var ok = requireFields(referralForm, names);
      var f = referralForm.elements;
      [1, 2].forEach(function (n) {
        var em = f["r" + n + "_email"].value.trim();
        var mo = f["r" + n + "_mobile"].value.trim();
        if (em && !isEmail(em)) { ok = false; markInvalid(f["r" + n + "_email"], "Please enter a valid email address."); }
        if (mo && !isMobile(mo)) { ok = false; markInvalid(f["r" + n + "_mobile"], "Please include the country code, for example +27 82 123 4567."); }
      });
      var e1 = f.r1_email.value.trim().toLowerCase();
      var e2 = f.r2_email.value.trim().toLowerCase();
      if (e1 && e1 === e2) { ok = false; markInvalid(f.r2_email, "Please invite two different people."); }
      if (!f.confirm.checked) { ok = false; markInvalid(f.confirm, "Please confirm before we send the invitations."); }
      if (!ok) {
        setStatus(referralStatus, "Please check the highlighted fields.", true);
        return;
      }
      if (f.website.value) {
        setStatus(referralStatus, "Thanks. We will send your invitations.", false);
        return;
      }
      var payload = {
        token: token,
        referrals: [1, 2].map(function (n) {
          return {
            name: f["r" + n + "_name"].value.trim(),
            email: f["r" + n + "_email"].value.trim(),
            mobile: cleanMobile(f["r" + n + "_mobile"].value.trim())
          };
        }),
        profile: {
          heard: f.heard ? f.heard.value : "",
          help: f.help ? f.help.value.trim() : ""
        },
        confirm: true,
        website: f.website.value
      };
      var btn = referralForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      setStatus(referralStatus, "Sending…", false);
      postJSON(JOIN_API + "/referrals", payload).then(function () {
        referralForm.querySelector(".form-grid").hidden = true;
        setStatus(referralStatus, "Thanks. We will send each of them one invitation and let you know when they join.", false);
        loadStatus();
      }).catch(function (err) {
        if (btn) btn.disabled = false;
        setStatus(referralStatus, errorText(err, "Sorry, we could not send your invitations just now. Please try again in a few minutes."), true);
      });
    });
  }
})();
