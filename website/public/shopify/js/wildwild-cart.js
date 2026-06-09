/**
 * Wild Wild Storefront Cart — shop.html integration
 * Requires window.WW_SHOPIFY_CONFIG (from shopify/config/storefront.public.js)
 */
(function () {
  "use strict";

  var CONFIG = window.WW_SHOPIFY_CONFIG || {};
  var CART_KEY = "ww_shopify_cart_id";
  var NO_PRINT_PREFIX = "no_print_";

  var state = {
    cart: null,
    open: false,
    loading: false,
    feedback: ""
  };

  function isConfigured() {
    return (
      CONFIG.storeDomain &&
      CONFIG.storefrontAccessToken &&
      CONFIG.storefrontAccessToken !== "YOUR_STOREFRONT_ACCESS_TOKEN" &&
      Object.keys(CONFIG.variantMap || {}).length > 0
    );
  }

  function apiUrl() {
    return (
      "https://" +
      CONFIG.storeDomain +
      "/api/" +
      (CONFIG.apiVersion || "2025-01") +
      "/graphql.json"
    );
  }

  function storefrontFetch(query, variables) {
    return fetch(apiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": CONFIG.storefrontAccessToken
      },
      body: JSON.stringify({ query: query, variables: variables || {} })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (payload) {
        if (payload.errors && payload.errors.length) {
          throw new Error(payload.errors.map(function (e) { return e.message; }).join("; "));
        }
        return payload.data;
      });
  }

  var CART_FIELDS = [
    "id",
    "checkoutUrl",
    "totalQuantity",
    "cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }",
    "discountCodes { code applicable }",
    "attributes { key value }",
    "lines(first: 50) {",
    "  nodes {",
    "    id",
    "    quantity",
    "    attributes { key value }",
    "    merchandise {",
    "      ... on ProductVariant {",
    "        id",
    "        title",
    "        product { id title }",
    "      }",
    "    }",
    "    cost { totalAmount { amount currencyCode } }",
    "  }",
    "}"
  ].join("\n");

  function cartQuery() {
    return "query Cart($id: ID!) { cart(id: $id) { " + CART_FIELDS + " } }";
  }

  function getStoredCartId() {
    try {
      return localStorage.getItem(CART_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeCartId(id) {
    try {
      if (id) localStorage.setItem(CART_KEY, id);
      else localStorage.removeItem(CART_KEY);
    } catch (e) { /* ignore */ }
  }

  function numericProductId(gid) {
    if (!gid) return "";
    var parts = String(gid).split("/");
    return parts[parts.length - 1];
  }

  function formatInr(amount) {
    var n = parseFloat(amount);
    if (isNaN(n)) return "₹0";
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  function getCartAttribute(cart, key) {
    if (!cart || !cart.attributes) return "";
    for (var i = 0; i < cart.attributes.length; i += 1) {
      if (cart.attributes[i].key === key) return cart.attributes[i].value || "";
    }
    return "";
  }

  function groupLinesByProduct(cart) {
    var groups = {};
    if (!cart || !cart.lines || !cart.lines.nodes) return groups;
    cart.lines.nodes.forEach(function (line) {
      var product = line.merchandise && line.merchandise.product;
      if (!product) return;
      var pid = product.id;
      if (!groups[pid]) {
        groups[pid] = {
          productId: pid,
          numericId: numericProductId(pid),
          title: product.title,
          lines: [],
          totalQty: 0
        };
      }
      groups[pid].lines.push(line);
      groups[pid].totalQty += line.quantity;
    });
    return groups;
  }

  function getEligibleNoPrintGroups(cart) {
    var groups = groupLinesByProduct(cart);
    var eligible = [];
    Object.keys(groups).forEach(function (key) {
      if (groups[key].totalQty >= 2) eligible.push(groups[key]);
    });
    return eligible;
  }

  function isNoPrintActive(cart, numericId) {
    return getCartAttribute(cart, NO_PRINT_PREFIX + numericId) === "true";
  }

  function buildFulfillmentAttributes(cart) {
    var attrs = {
      drop: CONFIG.drop || "Drop 01",
      creator_order: "false"
    };

    var zones = [];
    var groups = groupLinesByProduct(cart);
    Object.keys(groups).forEach(function (productGid) {
      var numericId = groups[productGid].numericId;
      var catalogEntry = findCatalogEntryByProductGid(productGid);
      if (catalogEntry && catalogEntry.zone) zones.push(catalogEntry.zone);

      var printLines = [];
      groups[productGid].lines.forEach(function (line, idx) {
        var linePrint = line.attributes && line.attributes.find(function (a) {
          return a.key === "print_included";
        });
        var val = linePrint ? linePrint.value : "true";
        printLines.push("line_" + (idx + 1) + ":" + val);
      });

      if (isNoPrintActive(cart, numericId)) {
        attrs[NO_PRINT_PREFIX + numericId] = "true";
      }
      attrs["print_status_" + numericId] = printLines.join("|");
    });

    attrs.zone = zones.length ? zones.join(",") : "core";

    var activeIds = [];
    Object.keys(groups).forEach(function (productGid) {
      var nid = groups[productGid].numericId;
      if (isNoPrintActive(cart, nid)) activeIds.push(nid);
    });
    attrs.ww_no_print_active = activeIds.join(",");

    return attrs;
  }

  function findCatalogEntryByProductGid(productGid) {
    var map = CONFIG.variantMap || {};
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i += 1) {
      if (map[keys[i]].productGid === productGid) return map[keys[i]];
    }
    return null;
  }

  function attributesToInput(attrs) {
    return Object.keys(attrs).map(function (key) {
      return { key: key, value: String(attrs[key]) };
    });
  }

  function refreshCart(cartId) {
    return storefrontFetch(cartQuery(), { id: cartId }).then(function (data) {
      state.cart = data.cart;
      updateCartBadge();
      if (state.open) renderCartDrawer();
      return state.cart;
    });
  }

  function createCart(lines) {
    var mutation =
      "mutation CreateCart($input: CartInput!) { cartCreate(input: $input) { cart { " +
      CART_FIELDS +
      " } userErrors { field message } } }";

    return storefrontFetch(mutation, {
      input: {
        lines: lines,
        attributes: [{ key: "drop", value: CONFIG.drop || "Drop 01" }]
      }
    }).then(function (data) {
      var result = data.cartCreate;
      if (result.userErrors && result.userErrors.length) {
        throw new Error(result.userErrors.map(function (e) { return e.message; }).join("; "));
      }
      state.cart = result.cart;
      storeCartId(state.cart.id);
      updateCartBadge();
      return state.cart;
    });
  }

  function addLines(lines) {
    state.loading = true;
    var cartId = getStoredCartId();

    if (!cartId) {
      return createCart(lines).finally(function () { state.loading = false; });
    }

    var mutation =
      "mutation AddLines($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { " +
      CART_FIELDS +
      " } userErrors { field message } } }";

    return storefrontFetch(mutation, { cartId: cartId, lines: lines })
      .then(function (data) {
        var result = data.cartLinesAdd;
        if (result.userErrors && result.userErrors.length) {
          throw new Error(result.userErrors.map(function (e) { return e.message; }).join("; "));
        }
        state.cart = result.cart;
        updateCartBadge();
        return syncFulfillmentAttributes();
      })
      .catch(function (err) {
        if (/not found|does not exist/i.test(err.message)) {
          storeCartId(null);
          return createCart(lines);
        }
        throw err;
      })
      .finally(function () { state.loading = false; });
  }

  function syncFulfillmentAttributes() {
    if (!state.cart) return Promise.resolve(null);
    var attrs = buildFulfillmentAttributes(state.cart);
    var mutation =
      "mutation UpdateAttrs($cartId: ID!, $attributes: [AttributeInput!]!) { cartAttributesUpdate(cartId: $cartId, attributes: $attributes) { cart { " +
      CART_FIELDS +
      " } userErrors { field message } } }";

    return storefrontFetch(mutation, {
      cartId: state.cart.id,
      attributes: attributesToInput(attrs)
    }).then(function (data) {
      var result = data.cartAttributesUpdate;
      if (result.userErrors && result.userErrors.length) {
        throw new Error(result.userErrors.map(function (e) { return e.message; }).join("; "));
      }
      state.cart = result.cart;
      return state.cart;
    });
  }

  function updateDiscountCodes(codes) {
    var mutation =
      "mutation DiscountCodes($cartId: ID!, $codes: [String!]!) { cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $codes) { cart { " +
      CART_FIELDS +
      " } userErrors { field message } } }";

    return storefrontFetch(mutation, {
      cartId: state.cart.id,
      codes: codes
    }).then(function (data) {
      var result = data.cartDiscountCodesUpdate;
      if (result.userErrors && result.userErrors.length) {
        throw new Error(result.userErrors.map(function (e) { return e.message; }).join("; "));
      }
      state.cart = result.cart;
      return state.cart;
    });
  }

  function updateLineAttributes(lineUpdates) {
    var mutation =
      "mutation UpdateLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { " +
      CART_FIELDS +
      " } userErrors { field message } } }";

    return storefrontFetch(mutation, {
      cartId: state.cart.id,
      lines: lineUpdates
    }).then(function (data) {
      var result = data.cartLinesUpdate;
      if (result.userErrors && result.userErrors.length) {
        throw new Error(result.userErrors.map(function (e) { return e.message; }).join("; "));
      }
      state.cart = result.cart;
      return state.cart;
    });
  }

  function applyNoPrintToGroup(group, enabled) {
    var numericId = group.numericId;
    var lineUpdates = [];

    group.lines.forEach(function (line, idx) {
      var printValue = "true";
      if (enabled) {
        if (group.lines.length >= 2 && idx === 1) printValue = "false";
        else if (group.lines.length === 1 && line.quantity >= 2) printValue = "mixed";
      }
      lineUpdates.push({
        id: line.id,
        attributes: [{ key: "print_included", value: printValue }]
      });
    });

    var attrs = {};
    attrs[NO_PRINT_PREFIX + numericId] = enabled ? "true" : "false";

    var activeRaw = getCartAttribute(state.cart, "ww_no_print_active");
    var activeSet = new Set(
      activeRaw.split(",").map(function (s) { return s.trim(); }).filter(Boolean)
    );
    if (enabled) activeSet.add(numericId);
    else activeSet.delete(numericId);
    attrs.ww_no_print_active = Array.from(activeSet).join(",");

    var mutation =
      "mutation UpdateAttrs($cartId: ID!, $attributes: [AttributeInput!]!) { cartAttributesUpdate(cartId: $cartId, attributes: $attributes) { cart { " +
      CART_FIELDS +
      " } userErrors { field message } } }";

    return updateLineAttributes(lineUpdates)
      .then(function () {
        return storefrontFetch(mutation, {
          cartId: state.cart.id,
          attributes: attributesToInput(attrs)
        });
      })
      .then(function (data) {
        state.cart = data.cartAttributesUpdate.cart;
        var codes = enabled ? [CONFIG.noWasteDiscountCode || "NOWASTE150"] : [];
        return updateDiscountCodes(codes);
      })
      .then(function () {
        return syncFulfillmentAttributes();
      });
  }

  function handleNoPrintToggle(checkbox) {
    var productGid = checkbox.getAttribute("data-product-gid");
    var groups = groupLinesByProduct(state.cart);
    var group = groups[productGid];
    if (!group) return;

    state.loading = true;
    applyNoPrintToGroup(group, checkbox.checked)
      .then(function () {
        showToggleFeedback(
          checkbox.checked
            ? "₹" + (CONFIG.noWasteDiscountAmount || 150) + " saved. Second package ships without duplicate print."
            : "Full unboxing restored for both packages."
        );
        renderCartDrawer();
      })
      .catch(function (err) {
        checkbox.checked = !checkbox.checked;
        showToggleFeedback("Could not update cart: " + err.message, true);
      })
      .finally(function () { state.loading = false; });
  }

  function showToggleFeedback(message, isError) {
    state.feedback = message;
    var el = document.getElementById("wwCartFeedback");
    if (el) {
      el.textContent = message;
      el.classList.toggle("is-error", !!isError);
      el.hidden = false;
    }
    if (!isError) {
      setTimeout(function () {
        state.feedback = "";
        if (el) el.hidden = true;
      }, 4000);
    }
  }

  function addProductToCart(catalogKey, size) {
    if (!isConfigured()) {
      alert(
        "Shopify is not configured yet.\n\nRun setup in the shopify/ folder:\n  cd shopify && cp .env.example .env\n  npm run setup\n\nThen reload this page."
      );
      return Promise.resolve();
    }

    var entry = CONFIG.variantMap[catalogKey];
    if (!entry) {
      alert("Product not found in Shopify config: " + catalogKey);
      return Promise.resolve();
    }

    var variantGid = entry[size];
    if (!variantGid) {
      alert("Size not available: " + size);
      return Promise.resolve();
    }

    state.loading = true;
    openCart();

    return addLines([
      {
        merchandiseId: variantGid,
        quantity: 1,
        attributes: [{ key: "print_included", value: "true" }]
      }
    ])
      .then(function () {
        showToggleFeedback("Added to cart.");
        renderCartDrawer();
      })
      .catch(function (err) {
        showToggleFeedback(err.message, true);
      })
      .finally(function () { state.loading = false; });
  }

  function updateCartBadge() {
    var badge = document.getElementById("wwCartCount");
    if (!badge) return;
    var qty = state.cart ? state.cart.totalQuantity : 0;
    badge.textContent = String(qty);
    badge.hidden = qty === 0;
  }

  function renderNoPrintToggle(group) {
    var numericId = group.numericId;
    var checked = isNoPrintActive(state.cart, numericId);

    return (
      '<div class="ww-no-print-toggle" data-product-id="' + numericId + '" data-product-gid="' + group.productId + '">' +
        '<div class="ww-toggle-header">' +
          '<span class="ww-toggle-icon" aria-hidden="true">🌿</span>' +
          "<strong>Zero-Waste Option</strong>" +
        "</div>" +
        '<p class="ww-toggle-body">You have two of the same design. Your second package will include a duplicate Hahnemühle fine-art print. Since prints are made individually for each order, skipping the duplicate means one fewer print is ever produced.</p>' +
        '<p class="ww-toggle-body">Opt out of the duplicate print and save <strong>₹' + (CONFIG.noWasteDiscountAmount || 150) + "</strong>. You keep both shirts. The first package includes the full unboxing — print, envelope, story card, stickers. The second ships in a plain compostable sleeve.</p>" +
        '<label class="ww-toggle-switch">' +
          '<input type="checkbox" id="noPrintToggle_' + numericId + '" data-product-gid="' + group.productId + '"' + (checked ? " checked" : "") + ">" +
          '<span class="ww-toggle-label">Skip duplicate print — save ₹' + (CONFIG.noWasteDiscountAmount || 150) + "</span>" +
        "</label>" +
        '<p class="ww-toggle-note">This is an environmental choice, not just a discount. Every return shipment has a carbon cost. Prints are made to order — opting out means it is never made.</p>' +
      "</div>"
    );
  }

  function renderCartDrawer() {
    var body = document.getElementById("wwCartBody");
    if (!body) return;

    if (!state.cart || !state.cart.totalQuantity) {
      body.innerHTML = '<p class="ww-cart-empty">Your cart is empty.</p>';
      return;
    }

    var html = '<ul class="ww-cart-lines">';
    state.cart.lines.nodes.forEach(function (line) {
      var title = line.merchandise.product.title;
      var variant = line.merchandise.title;
      html +=
        "<li>" +
          '<span class="ww-line-title">' + title + " — " + variant + "</span>" +
          '<span class="ww-line-qty">× ' + line.quantity + "</span>" +
          '<span class="ww-line-price">' + formatInr(line.cost.totalAmount.amount) + "</span>" +
        "</li>";
    });
    html += "</ul>";

    var eligible = getEligibleNoPrintGroups(state.cart);
    eligible.forEach(function (group) {
      html += renderNoPrintToggle(group);
    });

    var subtotal = state.cart.cost.subtotalAmount;
    var total = state.cart.cost.totalAmount;
    html +=
      '<div class="ww-cart-totals">' +
        "<div><span>Subtotal</span><span>" + formatInr(subtotal.amount) + "</span></div>" +
        "<div><span>Total</span><strong>" + formatInr(total.amount) + "</strong></div>" +
      "</div>";

    if (state.cart.discountCodes && state.cart.discountCodes.length) {
      html += '<p class="ww-cart-discount">Discount: ' + state.cart.discountCodes.map(function (d) {
        return d.code + (d.applicable ? "" : " (not applicable)");
      }).join(", ") + "</p>";
    }

    body.innerHTML = html;

    body.querySelectorAll(".ww-no-print-toggle input[type=checkbox]").forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        handleNoPrintToggle(checkbox);
      });
    });
  }

  function openCart() {
    state.open = true;
    var drawer = document.getElementById("wwCartDrawer");
    if (drawer) {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
    }
    renderCartDrawer();
  }

  function closeCart() {
    state.open = false;
    var drawer = document.getElementById("wwCartDrawer");
    if (drawer) {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
    }
  }

  function checkout() {
    if (!state.cart || !state.cart.checkoutUrl) return;
    window.location.href = state.cart.checkoutUrl;
  }

  function wireProductButtons() {
    document.querySelectorAll(".product-card").forEach(function (card) {
      var catalogKey = card.getAttribute("data-product");
      var btn = card.querySelector(".glass-button");
      if (!btn || btn.dataset.wwWired) return;
      btn.dataset.wwWired = "1";
      btn.addEventListener("click", function () {
        var selected = card.querySelector(".size-pill.is-selected");
        var size = selected ? selected.getAttribute("data-size") : "M";
        btn.disabled = true;
        addProductToCart(catalogKey, size).finally(function () {
          btn.disabled = false;
        });
      });
    });
  }

  function wireCartChrome() {
    var toggle = document.getElementById("wwCartToggle");
    var closeBtn = document.getElementById("wwCartClose");
    var backdrop = document.getElementById("wwCartBackdrop");
    var checkoutBtn = document.getElementById("wwCartCheckout");

    if (toggle) toggle.addEventListener("click", openCart);
    if (closeBtn) closeBtn.addEventListener("click", closeCart);
    if (backdrop) backdrop.addEventListener("click", closeCart);
    if (checkoutBtn) checkoutBtn.addEventListener("click", checkout);
  }

  function init() {
    wireCartChrome();
    wireProductButtons();

    if (!isConfigured()) {
      console.info("[Wild Wild] Shopify cart not configured — run shopify/ setup.");
      return;
    }

    var cartId = getStoredCartId();
    if (cartId) {
      refreshCart(cartId).catch(function () {
        storeCartId(null);
      });
    }
  }

  window.WildWildCart = {
    addProductToCart: addProductToCart,
    openCart: openCart,
    refresh: function () {
      var id = getStoredCartId();
      return id ? refreshCart(id) : Promise.resolve(null);
    },
    isConfigured: isConfigured
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
