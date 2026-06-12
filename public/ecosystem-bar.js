/**
 * FTH Ecosystem monetization strip — load on any Cloudflare property.
 * <script src="https://genesis402.com/ecosystem-bar.js" data-source="unykorn"></script>
 */
(function () {
  "use strict";
  if (window.__ECOSYSTEM_BAR__) return;
  window.__ECOSYSTEM_BAR__ = true;
  if (localStorage.getItem("ecosystem-bar-dismiss") === "1") return;

  var script = document.currentScript;
  var source =
    (script && script.getAttribute("data-source")) ||
    location.hostname.replace(/\./g, "_") ||
    "ecosystem";

  var host = location.hostname;
  var isVaultSite = /troptionsunity|legacy-vault|legacychain|vault\.genesis402/i.test(host);

  var VAULT =
    "https://troptionsunity.com/pricing?utm_source=" +
    encodeURIComponent(source) +
    "&utm_medium=strip&utm_campaign=ecosystem";
  var FRAUD =
    "https://blockchainfraud.org?utm_source=" +
    encodeURIComponent(source) +
    "&utm_medium=cross";
  var X402 =
    "https://genesis402.com/money?utm_source=" +
    encodeURIComponent(source) +
    "&utm_medium=x402";

  var style = document.createElement("style");
  style.textContent =
    ".ecosystem-money-strip{position:fixed;bottom:0;left:0;right:0;z-index:99999;display:flex;align-items:center;justify-content:center;gap:.75rem;flex-wrap:wrap;padding:.55rem 1rem;background:linear-gradient(90deg,#1e1912 0%,#6b5840 50%,#9e8855 100%);border-top:1px solid rgba(255,255,255,.12);color:#fdfaf6;font-family:system-ui,-apple-system,sans-serif;font-size:.78rem;font-weight:500;box-shadow:0 -8px 32px rgba(0,0,0,.35)}.ecosystem-money-strip .eco-msg{opacity:.95}.ecosystem-money-strip .eco-actions{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}.ecosystem-money-strip .eco-cta{display:inline-flex;align-items:center;padding:.4rem .85rem;border-radius:999px;font-size:.72rem;font-weight:700;text-decoration:none;white-space:nowrap;transition:transform .12s ease,opacity .12s ease}.ecosystem-money-strip .eco-cta:hover{transform:translateY(-1px);opacity:.95}.ecosystem-money-strip .eco-primary{background:#fdfaf6;color:#1a0f00}.ecosystem-money-strip .eco-secondary{background:rgba(255,255,255,.12);color:#fdfaf6;border:1px solid rgba(255,255,255,.2)}.ecosystem-money-strip .eco-x402{background:rgba(99,102,241,.35);color:#e0e7ff;border:1px solid rgba(129,140,248,.4)}.ecosystem-money-strip .eco-dismiss{background:transparent;border:none;color:rgba(255,255,255,.6);font-size:1.1rem;line-height:1;cursor:pointer;padding:.2rem .45rem;margin-left:.25rem}.ecosystem-money-strip .eco-dismiss:hover{color:#fff}";
  document.head.appendChild(style);

  var bar = document.createElement("div");
  bar.id = "ecosystem-money-strip";
  bar.className = "ecosystem-money-strip";
  bar.setAttribute("role", "complementary");
  bar.innerHTML =
    '<span class="eco-msg">' +
    (isVaultSite
      ? "Also in the FTH stack — fraud intelligence and x402 settlement"
      : "FTH ecosystem — estate vault, fraud scan, x402 settlement") +
    "</span>" +
    '<div class="eco-actions">' +
    (isVaultSite
      ? ""
      : '<a class="eco-cta eco-primary" href="' +
        VAULT +
        '">Legacy Vault — 14-day trial</a>') +
    '<a class="eco-cta eco-secondary" href="' +
    FRAUD +
    '">Fraud scan $9</a>' +
    '<a class="eco-cta eco-x402" href="' +
    X402 +
    '">x402 pay rails</a>' +
    '<button class="eco-dismiss" type="button" aria-label="Dismiss bar">&times;</button>' +
    "</div>";

  function mount() {
    document.body.appendChild(bar);
    var pb = parseInt(document.body.style.paddingBottom || "0", 10) || 0;
    if (pb < 52) document.body.style.paddingBottom = "52px";
    bar.querySelector(".eco-dismiss").addEventListener("click", function () {
      bar.remove();
      document.body.style.paddingBottom = "";
      localStorage.setItem("ecosystem-bar-dismiss", "1");
    });
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
