function getToken() {
  return localStorage.getItem("token");
}

function ensureAdminAccess() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "ADMIN") {
    window.location.replace("/admin-login.html");
    return false;
  }
  return true;
}

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function addProduct(event) {
  event.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    stock: document.getElementById("stock").value,
    category: document.getElementById("category").value,
    imageUrl: document.getElementById("imageUrl").value
  };

  const response = await fetch("/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    },
    body: JSON.stringify(data)
  });

  const msg = document.getElementById("message");
  if (!response.ok) {
    msg.innerText = "Failed to add product";
    msg.className = "msg msg--err";
    return;
  }

  msg.innerText = "Product added successfully!";
  msg.className = "msg msg--ok";
  setTimeout(() => { window.location.href = "/all-products-admin.html"; }, 1000);
}

async function loadAllProducts() {
  const response = await fetch("/admin/products", {
    headers: { "Authorization": "Bearer " + getToken() }
  });

  if (response.status === 401 || response.status === 403) {
    window.location.replace("/admin-login.html");
    return;
  }

  const products = await response.json();
  const productList = document.getElementById("productList");

  if (!products.length) {
    productList.innerHTML = '<p class="empty-state">No products found. <a href="/add-product.html">Add one now.</a></p>';
    return;
  }

  let html = `
    <div class="table-wrap">
      <table class="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  products.forEach(product => {
    html += `
      <tr>
        <td style="color:var(--muted);font-size:0.8rem;">#${product.id}</td>
        <td style="font-weight:600;">${product.name}</td>
        <td>₹${product.price}</td>
        <td>${product.stock}</td>
        <td><span class="category-tag">${product.category}</span></td>
        <td>
          <a href="/view-product-admin.html?id=${product.id}" class="btn btn--ghost btn--small">View</a>
          <a href="/edit-product.html?id=${product.id}" class="btn btn--dark btn--small">Edit</a>
          <button class="btn btn--small btn--delete" onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  productList.innerHTML = html;
}

async function loadProductDetails() {
  const id = getProductIdFromUrl();
  if (!id) return;

  const response = await fetch(`/admin/products/${id}`, {
    headers: { "Authorization": "Bearer " + getToken() }
  });

  if (response.status === 401 || response.status === 403) {
    window.location.replace("/admin-login.html");
    return;
  }

  const product = await response.json();
  const detailsDiv = document.getElementById("productDetails");

  detailsDiv.innerHTML = `
    <div class="product-detail-layout">
      <img class="product-image-preview" src="${product.imageUrl || '/images/placeholder-product.svg'}" alt="${product.name}" onerror="this.src='/images/placeholder-product.svg'" />
      <div class="product-detail-info">
        <h2 style="margin:0 0 4px;font-size:1.4rem;">${product.name}</h2>
        <p style="color:var(--muted);margin:0 0 20px;">${product.description}</p>
        <div class="detail-row"><span>ID</span><strong>#${product.id}</strong></div>
        <div class="detail-row"><span>Price</span><strong>₹${product.price}</strong></div>
        <div class="detail-row"><span>Stock</span><strong>${product.stock} units</strong></div>
        <div class="detail-row"><span>Category</span><strong>${product.category}</strong></div>
        <div style="margin-top:24px;display:flex;gap:10px;">
          <a href="/edit-product.html?id=${product.id}" class="btn btn--accent">Edit Product</a>
          <button class="btn btn--ghost" onclick="window.location.href='/all-products-admin.html'">← Back to list</button>
        </div>
      </div>
    </div>
  `;
}

async function prefillEditForm() {
  const id = getProductIdFromUrl();
  if (!id) return;

  const response = await fetch(`/admin/products/${id}`, {
    headers: { "Authorization": "Bearer " + getToken() }
  });

  if (response.status === 401 || response.status === 403) {
    window.location.replace("/admin-login.html");
    return;
  }

  const product = await response.json();
  document.getElementById("name").value = product.name;
  document.getElementById("description").value = product.description;
  document.getElementById("price").value = product.price;
  document.getElementById("stock").value = product.stock;
  document.getElementById("category").value = product.category;
  document.getElementById("imageUrl").value = product.imageUrl || "";
}

async function updateProduct(event) {
  event.preventDefault();

  const id = getProductIdFromUrl();
  const data = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    stock: document.getElementById("stock").value,
    category: document.getElementById("category").value,
    imageUrl: document.getElementById("imageUrl").value
  };

  const response = await fetch(`/admin/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    },
    body: JSON.stringify(data)
  });

  const msg = document.getElementById("message");
  if (!response.ok) {
    msg.innerText = "Failed to update product";
    msg.className = "msg msg--err";
    return;
  }

  msg.innerText = "Product updated successfully!";
  msg.className = "msg msg--ok";
  setTimeout(() => { window.location.href = "/all-products-admin.html"; }, 1000);
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  const response = await fetch(`/admin/products/${id}`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + getToken() }
  });

  if (!response.ok) {
    alert("Failed to delete product");
    return;
  }

  alert("Product deleted successfully");
  loadAllProducts();
}

document.addEventListener("DOMContentLoaded", () => {
  if (!ensureAdminAccess()) return;

  const addProductForm = document.getElementById("addProductForm");
  const editProductForm = document.getElementById("editProductForm");
  const productList = document.getElementById("productList");
  const productDetails = document.getElementById("productDetails");

  if (addProductForm) addProductForm.addEventListener("submit", addProduct);
  if (editProductForm) { prefillEditForm(); editProductForm.addEventListener("submit", updateProduct); }
  if (productList) loadAllProducts();
  if (productDetails) loadProductDetails();
});
