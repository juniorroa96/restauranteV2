const MENU_DATA = {
  "Entradas": [
    { id: 'e1', name: "Menú del dia", price: 14000, desc: "el mejor menu para cualquier dia", img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'e2', name: "Pizza", price: 15000, desc: "Pizza de muy buena calidad", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'e3', name: "Hamburgesa con papas fritas", price: 20000, desc: "Hamburgesa barata y buena", img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&h=400&q=80" }
  ],
  "Platos": [
    { id: 'p1', name: "Bandeja Saludable", price: 20000, desc: "Para que sigas con tu dieta puedes pedir este plato", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'p2', name: "Sopa de pollo", price: 15000, desc: "Sopa tradicional con pollo", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'p3', name: "Pollo con caldo", price: 28000, desc: "Caldo sustancioso con pollo ", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'p4', name: "Frijoles con arepa", price: 12000, desc: "Frijoles con arepa muy buenos", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'p5', name: "Carne con papas", price: 20000, desc: "Carne muy frezca con papas a su punto", img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&h=400&q=80" }
  ],
  "Bebidas": [
    { id: 'b1', name: "Limonada", price: 4000, desc: "Bebida fria super deliciosa.", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'b3', name: "Café", price: 5000, desc: "Café tradicional hervido con canela y panela.", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'b4', name: "Jugo de mora", price: 5000, desc: "Bebida ancestral a base mora", img: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&h=400&q=80" }
  ],
  "Postres": [
    { id: 'd1', name: "Pastel de Chocolate ", price: 30000, desc: "Pasetel de chocolate pa que quede lleno", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'd2', name: "Postre de Fresas", price: 7000, desc: "Fresas buenas para agregarle dulce a la comida", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'd3', name: "Brevas con Arequipe", price: 7000, desc: "Arequipe de la mas alta calidad", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&h=400&q=80" },
    { id: 'd4', name: "Torta de Estrellas", price: 50000, desc: "torta que viene del espacio", img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&h=400&q=80" }
  ]
};

let cart = {}; // estado
let activeCat = "Entradas";
let searchQuery = "";
let lastOrderId = localStorage.getItem('lastOrderId') || '';

const STATUS_LABELS = {
  pending: 'Pendiente (en cola)',
  cooking: 'Cocina (en preparación)',
  delivered: 'Entregado',
  error: 'Estado no disponible'
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
};

function renderTabs() {
  const container = document.getElementById('tabs-container');
  container.innerHTML = '';
  Object.keys(MENU_DATA).forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `tab ${cat === activeCat ? 'active' : ''}`;
    btn.textContent = cat;
    btn.onclick = () => {
      activeCat = cat;
      renderTabs();
      renderMenu();
    };
    container.appendChild(btn);
  });
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  grid.innerHTML = '';
  const query = searchQuery.trim().toLowerCase();
  const allItems = Object.values(MENU_DATA).flat();
  const filteredItems = query
    ? allItems.filter(item => item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query))
    : (MENU_DATA[activeCat] || []);

  if (query && filteredItems.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 32px 0;">No se encontraron resultados para "${searchQuery}"</p>`;
    return;
  }

  filteredItems.forEach((item, index) => {
    const qtyInCart = cart[item.id] ? cart[item.id].qty : 0;
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${index * 0.05}s`;

    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${item.img}" alt="${item.name}" loading="lazy">
        <div class="price-badge">${formatPrice(item.price)}</div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${item.name}</h3>
        <p class="card-desc">${item.desc}</p>
        <div id="controls-${item.id}" style="margin-top: auto;"></div>
      </div>
    `;

    grid.appendChild(card);
    renderCardControls(item);
  });
}

function renderCardControls(item) {
  const container = document.getElementById(`controls-${item.id}`);
  if (!container) return;

  const qtyInCart = cart[item.id] ? cart[item.id].qty : 0;

  if (qtyInCart === 0) {
    container.innerHTML = `
      <button class="btn-add" onclick='addToCart(${JSON.stringify(item)})'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Agregar
      </button>
    `;
  } else {
    container.innerHTML = `
      <div class="inline-controls">
        <button class="ctrl-btn" onclick="updateQty('${item.id}', -1)">-</button>
        <span class="ctrl-qty">${qtyInCart}</span>
        <button class="ctrl-btn" onclick="updateQty('${item.id}', 1)">+</button>
      </div>
    `;
  }
}

function addToCart(item) {
  if (!cart[item.id]) {
    cart[item.id] = { ...item, qty: 1 };
  } else {
    cart[item.id].qty += 1;
  }
  renderCardControls(item);
  updateCartUI();
}

function updateQty(id, delta) {
  if (cart[id]) {
    cart[id].qty += delta;

    if (cart[id].qty <= 0) {
      delete cart[id];
    }

    const currentItem = Object.values(MENU_DATA).flat().find(i => i.id === id);
    if (currentItem) {
      renderCardControls(currentItem);
    }
    updateCartUI();
  }
}

function removeItem(id) {
  delete cart[id];
  const currentItem = Object.values(MENU_DATA).flat().find(i => i.id === id);
  if (currentItem && document.getElementById(`controls-${id}`)) {
    renderCardControls(currentItem);
  }
  updateCartUI();
}

function updateCartUI() {
  const items = Object.values(cart);
  const totalCount = items.reduce((acc, obj) => acc + obj.qty, 0);
  const totalPrice = items.reduce((acc, obj) => acc + (obj.price * obj.qty), 0);

  const badge = document.getElementById('fab-badge');
  if (totalCount > 0) {
    badge.textContent = totalCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  const footer = document.getElementById('drawer-footer');
  footer.style.display = totalCount > 0 ? 'block' : 'none';

  document.getElementById('cart-total').textContent = formatPrice(totalPrice);

  const listContainer = document.getElementById('cart-items');
  if (totalCount === 0) {
    listContainer.innerHTML = `
      <div class="cart-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        <p>Tu carrito está vacío</p>
      </div>
    `;
  } else {
    listContainer.innerHTML = items.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
        </div>
        <div class="cart-item-controls">
          <div class="mini-controls">
            <button class="ctrl-btn" onclick="updateQty('${item.id}', -1)">-</button>
            <div class="ctrl-qty">${item.qty}</div>
            <button class="ctrl-btn" onclick="updateQty('${item.id}', 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeItem('${item.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }
}

function toggleDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('drawer-overlay');

  const isDesktop = window.innerWidth >= 768;

  overlay.classList.toggle('active');

  if (isDesktop) {
    drawer.classList.toggle('activeDesktop');
  } else {
    drawer.classList.toggle('active');
  }
}

function confirmOrder() {
  toggleDrawer();
  const orderId = `ORD-${Date.now()}`;
  saveOrderId(orderId);
  setOrderStatus('pending');
  setModalOrderId(orderId);

  setTimeout(() => {
    document.getElementById('success-modal').classList.add('active');
  }, 300);
}

function setModalOrderId(orderId) {
  const node = document.getElementById('modal-order-id');
  if (!node) return;
  node.innerHTML = `ID de pedido: <strong>${orderId}</strong>`;
}

function closeModal() {
  document.getElementById('success-modal').classList.remove('active');
  cart = {};
  renderMenu();
  updateCartUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleSearch() {
  const input = document.getElementById('search-input');
  searchQuery = input.value;
  renderMenu();
}

function clearSearch() {
  searchQuery = '';
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  renderMenu();
}

function setupSearch() {
  const input = document.getElementById('search-input');
  const button = document.getElementById('search-button');
  const clearButton = document.getElementById('clear-button');
  if (!button || !input || !clearButton) return;
  button.addEventListener('click', handleSearch);
  clearButton.addEventListener('click', clearSearch);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  });
}

function saveOrderId(orderId) {
  lastOrderId = orderId;
  localStorage.setItem('lastOrderId', orderId);
  const input = document.getElementById('order-id-input');
  if (input) input.value = orderId;
}

function setOrderStatus(status) {
  const pill = document.getElementById('order-status-pill');
  if (!pill) return;
  pill.textContent = STATUS_LABELS[status] || STATUS_LABELS.error;
  pill.className = `status-pill ${status}`;
}

function normalizeStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized.includes('pend')) return 'pending';
  if (normalized.includes('cocina') || normalized.includes('prepar') || normalized.includes('kitchen')) return 'cooking';
  if (normalized.includes('entreg') || normalized.includes('deliv') || normalized.includes('done')) return 'delivered';
  return 'pending';
}

function mockOrderStatus(orderId) {
  const index = Array.from(orderId).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3;
  return ['Pendiente (en cola)', 'Cocina (en preparación)', 'Entregado'][index];
}

async function queryOrderStatus(orderId) {
  if (!orderId) {
    throw new Error('Falta el ID de pedido');
  }

  const url = `/api/order-status?orderId=${encodeURIComponent(orderId)}`;
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.status || data.estado || data.phase || mockOrderStatus(orderId);
  } catch (error) {
    console.warn('Error consultando estado del pedido:', error);
    return mockOrderStatus(orderId);
  }
}

async function handleStatusCheck() {
  const input = document.getElementById('order-id-input');
  const orderId = (input?.value || lastOrderId || '').trim();
  if (!orderId) {
    setOrderStatus('error');
    return;
  }

  saveOrderId(orderId);
  setOrderStatus('pending');

  const statusText = await queryOrderStatus(orderId);
  const normalized = normalizeStatus(statusText);
  setOrderStatus(normalized);
}

function initOrderStatus() {
  const button = document.getElementById('status-button');
  const input = document.getElementById('order-id-input');
  if (!button || !input) return;

  button.addEventListener('click', handleStatusCheck);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleStatusCheck();
    }
  });

  if (lastOrderId) {
    input.value = lastOrderId;
    setOrderStatus('pending');
  }
}

function init() {
  setupSearch();
  initOrderStatus();
  renderTabs();
  renderMenu();
  updateCartUI();
}

init();
