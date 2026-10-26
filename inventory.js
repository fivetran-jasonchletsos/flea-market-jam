(function () {
  var $ = function (id) { return document.getElementById(id); };
  var items = [];
  var NAMES = { "cobalt-glass": "Cobalt blue glass", jewelry: "Jewelry", antique: "Antique", other: "Other" };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return n == null ? "" : "$" + Math.round(n); }

  function draw() {
    var f = $("filter").value;
    var list = items.filter(function (i) { return !f || i.category === f; });
    $("total").textContent = list.length + " item" + (list.length === 1 ? "" : "s");
    $("grid").innerHTML = list.length ? list.map(function (i) {
      var img = i.photos && i.photos[0] ? '<img loading="lazy" alt="" src="' + esc(i.photos[0]) + '">' : '<img alt="" src="">';
      return '<button class="it" data-id="' + esc(i.id) + '">' + img + '<div><strong>' + esc(i.title || i.item_name) +
        '</strong><br><span class="muted">' + esc(NAMES[i.category] || "") + '</span><br>' +
        '<span class="muted">asking ' + money(i.asking_price) + ' &middot; est. ' + money(i.price_low) + ' to ' + money(i.price_high) + '</span></div></button>';
    }).join("") : '<p class="muted">Nothing published yet.</p>';
  }
  $("filter").addEventListener("change", draw);
  $("grid").addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-id]");
    if (!b) return;
    var i = items.filter(function (x) { return x.id === b.getAttribute("data-id"); })[0];
    if (!i) return;
    $("dbody").innerHTML =
      (i.photos || []).map(function (p) { return '<img alt="" style="width:100%;border-radius:6px;margin-bottom:8px" src="' + esc(p) + '">'; }).join("") +
      '<h2 style="margin-top:0">' + esc(i.item_name) + '</h2>' +
      '<p>' + esc(i.item_type) + ' &middot; ' + esc(i.era_guess) + '</p>' +
      '<p><strong>Asking:</strong> ' + money(i.asking_price) + ' &middot; <strong>Estimate:</strong> ' + money(i.price_low) + ' to ' + money(i.price_high) +
      ' (' + esc(i.price_confidence) + ' confidence)</p>' +
      '<p><strong>Materials:</strong> ' + esc(i.materials) + '<br><strong>Maker guess:</strong> ' + esc(i.maker_guess) +
      '<br><strong>Marks:</strong> ' + esc(i.marks_seen) + '<br><strong>Condition:</strong> ' + esc(i.condition_notes) + '</p>' +
      '<p>' + esc(i.description) + '</p>' +
      '<p class="muted">Check sold prices: <a target="_blank" rel="noopener" href="https://www.ebay.com/sch/i.html?_nkw=' + encodeURIComponent(i.comp_search_terms || "") + '&LH_Sold=1&LH_Complete=1">eBay sold listings</a></p>';
    $("dlg").showModal();
  });
  $("close").addEventListener("click", function () { $("dlg").close(); });
  $("csv").addEventListener("click", function () {
    var cols = ["id", "published", "category", "title", "asking_price", "price_low", "price_high", "price_confidence", "best_platform", "ebay_title", "etsy_title", "marketplace_title", "description"];
    var rows = [cols.join(",")].concat(items.map(function (i) {
      return cols.map(function (c) { return '"' + String(i[c] == null ? "" : i[c]).replace(/"/g, '""') + '"'; }).join(",");
    }));
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    a.download = "inventory.csv"; a.click();
  });

  fetch("data/index.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : { items: [] }; })
    .catch(function () { return { items: [] }; })
    .then(function (j) { items = j.items || []; draw(); });
})();
