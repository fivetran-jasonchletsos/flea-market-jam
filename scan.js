(function () {
  var API = (window.JAM && window.JAM.api) || "";
  var $ = function (id) { return document.getElementById(id); };
  var TIPS = {
    "cobalt-glass": "Take a photo of the whole piece, one of the base straight on, one of any mark, and one of the rim. Reproductions are common, so the base matters most.",
    jewelry: "Take the whole piece, then close-ups of every stamp and the clasp. A metal stamp cannot be confirmed from a photo, so keep the close-ups sharp.",
    antique: "Take the whole piece, a close-up of any carving or decoration, the joints or underside, and any label or stamp.",
    other: "Take the whole item and any marks or labels."
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---- service calls ----
  function call(path, body) {
    return fetch(API + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.error || "request failed"); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  if (!API) { $("runmsg").textContent = "The scanner service is not connected yet."; }
  renderQueue();

  // ---- photos: resize and re-encode in the browser, which also removes location data ----
  var photos = []; // base64 jpeg strings, no prefix
  function toJpeg(file) {
    return createImageBitmap(file, { imageOrientation: "from-image" }).then(function (bmp) {
      var max = 1280, s = Math.min(1, max / Math.max(bmp.width, bmp.height));
      var c = document.createElement("canvas");
      c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(res, "image/jpeg", 0.82); });
    }).then(function (blob) {
      return new Promise(function (res) {
        var fr = new FileReader();
        fr.onload = function () { res(String(fr.result).split(",")[1]); };
        fr.readAsDataURL(blob);
      });
    });
  }
  function drawThumbs() {
    $("thumbs").innerHTML = photos.map(function (p, i) {
      return '<button class="thumb" data-rmphoto="' + i + '" aria-label="Remove photo ' + (i + 1) + '">' +
        '<img alt="photo ' + (i + 1) + '" src="data:image/jpeg;base64,' + p + '"></button>';
    }).join("");
    $("photocount").textContent = photos.length ? photos.length + " of 4 added" : "none yet, up to 4";
    $("run").disabled = photos.length < 1;
  }
  $("thumbs").addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-rmphoto]");
    if (!b) return;
    photos.splice(Number(b.getAttribute("data-rmphoto")), 1); drawThumbs();
  });
  // Photos add up one tap at a time, so a single hand can build the set.
  function addFiles(e) {
    var room = 4 - photos.length;
    var files = Array.prototype.slice.call(e.target.files).slice(0, Math.max(room, 0));
    e.target.value = "";
    if (!files.length) { $("runmsg").textContent = room <= 0 ? "That is 4 photos. Tap one to remove it." : ""; return; }
    $("runmsg").textContent = "Preparing photo...";
    Promise.all(files.map(toJpeg)).then(function (list) {
      photos = photos.concat(list).slice(0, 4); drawThumbs(); $("runmsg").textContent = "";
    }).catch(function () { $("runmsg").textContent = "Could not read that photo. Try again."; });
  }
  $("shoot").addEventListener("change", addFiles);
  $("pick").addEventListener("change", addFiles);
  function tip() { $("tip").textContent = TIPS[$("cat").value]; }
  $("cat").addEventListener("change", tip); tip();

  // ---- identify ----
  var current = null;
  function compLinks(terms) {
    var q = encodeURIComponent(terms || "");
    return '<a href="https://www.ebay.com/sch/i.html?_nkw=' + q + '&LH_Sold=1&LH_Complete=1" target="_blank" rel="noopener">eBay sold listings</a> &middot; ' +
      '<a href="https://www.etsy.com/search?q=' + q + '" target="_blank" rel="noopener">Etsy</a> &middot; ' +
      '<a href="https://www.facebook.com/marketplace/search/?query=' + q + '" target="_blank" rel="noopener">Marketplace</a>';
  }
  function list(arr) {
    return arr && arr.length ? "<ul>" + arr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "";
  }
  function copyBox(label, text) {
    return '<label>' + esc(label) + '</label><div class="copybox" data-copy>' + esc(text) + '</div>';
  }
  function show(r) {
    current = r;
    var mid = Math.round((r.price_low + r.price_high) / 2);
    $("result").innerHTML =
      '<div class="card"><h2 style="margin-top:0">' + esc(r.item_name) + '</h2>' +
      '<p>' + esc(r.item_type) + ' &middot; ' + esc(r.era_guess) + '</p>' +
      '<div class="price">$' + Math.round(r.price_low) + ' to $' + Math.round(r.price_high) + '</div>' +
      '<p>AI estimate, confidence <span class="badge ' + esc(r.price_confidence) + '">' + esc(r.price_confidence) + '</span> ' +
      '&middot; reproduction risk <span class="badge ' + (r.reproduction_risk === "high" ? "low" : r.reproduction_risk === "medium" ? "medium" : r.reproduction_risk === "low" ? "high" : "unknown") + '">' + esc(r.reproduction_risk) + '</span></p>' +
      '<p>Quick-sale price: <strong>$' + Math.round(r.quick_sale_price) + '</strong></p>' +
      '<p class="muted">' + esc(r.price_reasoning) + '</p>' +
      '<p><strong>Check it:</strong> ' + compLinks(r.comp_search_terms) + '<br><span class="muted">Search phrase: ' + esc(r.comp_search_terms) + '</span></p></div>' +
      (r.needs_more_photos && r.needs_more_photos.length ? '<div class="note"><strong>Photos that would help:</strong>' + list(r.needs_more_photos) + '</div>' : '') +
      (r.legal_flags && r.legal_flags.length ? '<div class="warn"><strong>Check before selling:</strong>' + list(r.legal_flags) + '</div>' : '') +
      (r.authenticity_flags && r.authenticity_flags.length ? '<div class="note"><strong>Authenticity flags:</strong>' + list(r.authenticity_flags) + '</div>' : '') +
      '<div class="card"><h3 style="margin-top:0">Details</h3>' +
      '<p><strong>Materials:</strong> ' + esc(r.materials) + '<br><strong>Maker guess:</strong> ' + esc(r.maker_guess) +
      '<br><strong>Marks seen:</strong> ' + esc(r.marks_seen) + '<br><strong>Condition:</strong> ' + esc(r.condition_notes) +
      '<br><strong>Shipping:</strong> ' + esc(r.shipping_notes) + '</p>' +
      '<p><strong>Best place to sell:</strong> ' + esc(r.best_platform) + '. ' + esc(r.best_platform_reason) + '</p></div>' +
      '<div class="card"><h3 style="margin-top:0">Draft listings</h3><p class="muted">Tap a box to copy it. Marketplace and Etsy listings are made by hand, so these are for pasting.</p>' +
      copyBox("eBay title (" + r.ebay_title.length + "/80)", r.ebay_title) +
      copyBox("Etsy title (" + r.etsy_title.length + "/140)", r.etsy_title) +
      copyBox("Etsy tags (" + r.etsy_tags.length + "/13)", r.etsy_tags.join(", ")) +
      copyBox("Marketplace title", r.marketplace_title) +
      copyBox("Description", r.description) + '</div>' +
      '<div class="card"><label for="ask">Your asking price (dollars)</label><input id="ask" type="number" min="0" step="1" value="' + mid + '">' +
      '<label for="ttl">Title to keep</label><input id="ttl" type="text" value="' + esc(r.ebay_title) + '">' +
      '<div class="row" style="margin-top:12px"><button class="bigbtn" id="add">Add to publish queue</button><span class="muted" id="addmsg"></span></div></div>';
    $("result").scrollIntoView({ behavior: "smooth" });
  }
  $("result").addEventListener("click", function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute("data-copy") && navigator.clipboard) {
      navigator.clipboard.writeText(t.textContent); t.style.outline = "2px solid #1c7a3b";
      setTimeout(function () { t.style.outline = ""; }, 700);
    }
    if (t.id === "add") addToQueue();
  });
  $("run").addEventListener("click", function () {
    $("run").disabled = true; $("runmsg").textContent = "Looking at your photos. This can take up to a minute.";
    call("/identify", { category: $("cat").value, images: photos, notes: $("notes").value })
      .then(function (j) { $("runmsg").textContent = ""; show(j.result); })
      .catch(function (e) { $("runmsg").textContent = e.message; })
      .then(function () { $("run").disabled = photos.length < 1; });
  });

  // ---- queue in IndexedDB (photos are too large for localStorage) ----
  function db() {
    return new Promise(function (res, rej) {
      var o = indexedDB.open("jam", 1);
      o.onupgradeneeded = function () { o.result.createObjectStore("queue", { keyPath: "id" }); };
      o.onsuccess = function () { res(o.result); }; o.onerror = function () { rej(o.error); };
    });
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction("queue", mode), s = t.objectStore("queue"), out = fn(s);
        t.oncomplete = function () { res(out && out.result); }; t.onerror = function () { rej(t.error); };
      });
    });
  }
  function addToQueue() {
    var fields = Object.assign({}, current, {
      title: $("ttl").value, asking_price: Number($("ask").value) || null, category: $("cat").value
    });
    var item = { id: String(Date.now()), fields: fields, images: photos.slice(0, 3), include: true };
    tx("readwrite", function (s) { return s.put(item); }).then(function () {
      $("addmsg").textContent = "Added."; renderQueue();
      $("result").innerHTML = ""; photos = []; drawThumbs(); $("notes").value = "";
    });
  }
  function getQueue() { return tx("readonly", function (s) { return s.getAll(); }); }
  function renderQueue() {
    getQueue().then(function (items) {
      items = items || [];
      $("queue").innerHTML = items.length ? items.map(function (it) {
        return '<div class="card"><div class="row"><div style="flex:1"><strong>' + esc(it.fields.title || it.fields.item_name) + '</strong><br>' +
          '<span class="muted">asking $' + esc(it.fields.asking_price) + ' &middot; ' + it.images.length + ' photo(s)</span></div>' +
          '<button class="bigbtn alt" data-rm="' + esc(it.id) + '">Remove</button></div></div>';
      }).join("") : '<p class="muted">Nothing queued yet.</p>';
      $("publish").disabled = !items.length;
    });
  }
  $("queue").addEventListener("click", function (e) {
    var id = e.target.getAttribute && e.target.getAttribute("data-rm");
    if (id) tx("readwrite", function (s) { return s.delete(id); }).then(renderQueue);
  });
  $("publish").addEventListener("click", function () {
    getQueue().then(function (items) {
      var batch = items.slice(0, 8);
      if (!batch.length) return;
      if (!confirm("Publish " + batch.length + " item(s) with their photos to the public Inventory page?")) return;
      $("publish").disabled = true; $("pubmsg").textContent = "Publishing...";
      return call("/publish", { items: batch.map(function (it) { return { fields: it.fields, images: it.images }; }) })
        .then(function () {
          return tx("readwrite", function (s) { batch.forEach(function (it) { s.delete(it.id); }); });
        }).then(function () {
          $("pubmsg").innerHTML = 'Published. The Inventory page updates in about a minute. <a href="inventory.html">Open Inventory</a>';
          renderQueue();
        });
    }).catch(function (e) { $("pubmsg").textContent = e.message; renderQueue(); });
  });
})();
