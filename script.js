/* ---------- Data ---------- */
const menu = [
  { name: "Biryani", price: 250, img: "biryani.jpg" },
  { name: "Zinger Burger", price: 300, img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=900&auto=format&fit=crop" },
  { name: "Pizza Slice", price: 200, img: "pizza.jpg" },
  { name: "Fries", price: 120, img: "fries.jpg" },

  /* extra items */
  { name: "Cold Coffee", price: 180, img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=900&auto=format&fit=crop" },
  { name: "Club Sandwich", price: 260, img: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=900&auto=format&fit=crop" },
  { name: "Chicken Karahi", price: 450, img: "chic.jpg" },
  { name: "Chicken Pasta", price: 320, img: "pasta.jpg" },
  { name: "Loaded Fries", price: 250, img: "loaded fries.jpg" },
  { name: "Beef Burger", price: 350, img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=900&auto=format&fit=crop" },
  { name: "Chicken Shawarma", price: 180, img: "shuarma.jpg" },
  { name: "Hot Coffee", price: 120, img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=900&auto=format&fit=crop" },
  { name: "Chicken Roll", price: 150, img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=900&auto=format&fit=crop" },
  { name: "Nuggets (6 pcs)", price: 200, img: "nuggets.jpg" },
  { name: "Chocolate Shake", price: 220, img: "chocolateshake.jpg" },
  { name: "Garlic Mayo Fries", price: 200, img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=900&auto=format&fit=crop" }
];

let cart = [];

/* ---------- Elements ---------- */
const menuEl = document.getElementById("menu");
const toast = document.getElementById("toast");
const cartBtn = document.getElementById("openCart");
const closeCartBtn = document.getElementById("closeCart");
const cartPanel = document.getElementById("cart");
const cartItemsEl = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const subtotalEl = document.getElementById("subtotal");
const confirmOrder = document.getElementById("confirmOrder");
const orderModal = document.getElementById("orderModal");
const orderSummary = document.getElementById("order-summary");
const placeFinal = document.getElementById("placeFinal");
const cancelOrder = document.getElementById("cancelOrder");
const checkoutBtn = document.getElementById("checkoutBtn");

/* ---------- Render Menu ---------- */
function renderMenu(){
  menuEl.innerHTML = "";
  menu.forEach((it, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="photo"><img src="${it.img}" alt="${it.name}"></div>
      <div class="info">
        <h3>${it.name}</h3>
        <p>${it.description || "Made fresh to order."}</p>
        <div class="price">PKR ${it.price}</div>
        <div class="controls">
          <button class="add-btn" data-index="${idx}">Add</button>
          <button class="add-btn primary" data-index="${idx}">Add +</button>
        </div>
      </div>
    `;
    menuEl.appendChild(card);
  });

  // attach listeners
  document.querySelectorAll(".add-btn").forEach(b=>{
    b.addEventListener("click", (e)=>{
      const i = parseInt(b.dataset.index);
      doAddToCart(i, b);
    });
  });
}

/* ---------- Add to Cart (with animation) ---------- */
function doAddToCart(index, buttonEl){
  // animate flying image
  const img = buttonEl.closest(".card").querySelector("img");
  flyImage(img);

  // add to cart logic
  const item = {...menu[index]}; // shallow copy
  const found = cart.find(c=>c.name === item.name);
  if(found) found.qty++;
  else cart.push({...item, qty:1});

  updateCartUI();
  showToast("Added to cart");
}

/* flying image animation */
function flyImage(img){
  if(!img) return;
  const clone = img.cloneNode(true);
  const rect = img.getBoundingClientRect();
  clone.style.position = "fixed";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";
  clone.style.zIndex = 9999;
  clone.style.transition = "all 700ms cubic-bezier(.2,.9,.2,1)";
  clone.style.borderRadius = "10px";
  document.body.appendChild(clone);

  // target = cart icon
  const target = cartBtn.getBoundingClientRect();
  setTimeout(()=>{
    clone.style.left = (target.left + 10) + "px";
    clone.style.top = (target.top + 10) + "px";
    clone.style.width = "40px";
    clone.style.height = "40px";
    clone.style.opacity = "0.6";
    clone.style.transform = "rotate(-15deg) scale(.6)";
  }, 20);

  setTimeout(()=> clone.remove(), 800);
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(text){
  toast.textContent = text || "Added to cart";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove("show"), 1500);
}

/* ---------- Cart UI ---------- */
function updateCartUI(){
  cartItemsEl.innerHTML = "";
  let total = 0;
  cart.forEach((it, i) => {
    total += it.price * it.qty;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div>
        <div style="font-weight:700">${it.name}</div>
        <div style="color:var(--muted); font-size:13px">PKR ${it.price} × ${it.qty}</div>
      </div>
      <div class="qty">
        <button class="minus" data-i="${i}">−</button>
        <div style="min-width:22px; text-align:center">${it.qty}</div>
        <button class="plus" data-i="${i}">+</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  cartCount.textContent = cart.reduce((s,x)=>s+x.qty,0) || 0;
  subtotalEl.textContent = `PKR ${total}`;
  attachQtyListeners();
}

/* attach plus/minus */
function attachQtyListeners(){
  document.querySelectorAll(".plus").forEach(b=>{
    b.onclick = ()=> {
      const i = +b.dataset.i;
      cart[i].qty++;
      updateCartUI();
    }
  });
  document.querySelectorAll(".minus").forEach(b=>{
    b.onclick = ()=> {
      const i = +b.dataset.i;
      cart[i].qty--;
      if(cart[i].qty <= 0) cart.splice(i,1);
      updateCartUI();
    }
  });
}

/* ---------- Cart open/close ---------- */
cartBtn.addEventListener("click", ()=> {
  cartPanel.classList.toggle("open");
});
closeCartBtn?.addEventListener("click", ()=> cartPanel.classList.remove("open"));

/* ---------- Checkout flow ---------- */
confirmOrder.addEventListener("click", openOrderModal);
checkoutBtn.addEventListener("click", openOrderModal);

function openOrderModal(){
  if(cart.length === 0){
    showToast("Your cart is empty");
    return;
  }
  orderSummary.innerHTML = "";
  cart.forEach(it=>{
    const el = document.createElement("div");
    el.style.display = "flex";
    el.style.justifyContent = "space-between";
    el.style.padding = "6px 0";
    el.innerHTML = `<div>${it.name} × ${it.qty}</div><div>PKR ${it.price * it.qty}</div>`;
    orderSummary.appendChild(el);
  });
  const total = cart.reduce((s,x)=>s + x.price * x.qty, 0);
  const totalRow = document.createElement("div");
  totalRow.style.display = "flex";
  totalRow.style.justifyContent = "space-between";
  totalRow.style.paddingTop = "10px";
  totalRow.style.borderTop = "1px dashed rgba(255,255,255,0.06)";
  totalRow.innerHTML = `<strong>Total</strong><strong>PKR ${total}</strong>`;
  orderSummary.appendChild(totalRow);

  orderModal.setAttribute("aria-hidden","false");
  cartPanel.classList.remove("open");
}

/* place final order */
placeFinal.addEventListener("click", ()=>{
  // simple confirmation
  orderModal.setAttribute("aria-hidden","true");
  showToast("Order placed — thank you!");
  cart = [];
  updateCartUI();
});

/* cancel modal */
cancelOrder.addEventListener("click", ()=> orderModal.setAttribute("aria-hidden","true"));

/* close modal on outside click */
orderModal.addEventListener("click", (e)=>{
  if(e.target === orderModal) orderModal.setAttribute("aria-hidden","true");
});

/* init */
renderMenu();
updateCartUI();





    
