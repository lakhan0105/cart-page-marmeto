import { getStorage, setStorage } from "./utils/utils.js";

const URL =
  "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889";

// variable to store the cartItems
let cartItems = getStorage("cartItems");

// init function (runs when the page loads)
const init = async () => {
  const data = await fetchData();

  // map over the fetched data and add it into cartItems
  cartItems = data.items.map((item) => {
    const { id, product_title, quantity, product_id, price, image } = item;
    return { id, product_title, quantity, product_id, price, image };
  });
  setStorage("cartItems", cartItems);
  displayCartItems(cartItems);
  updateCartSubTotal();

  // select all numInputEls and listen to input
  const numInputEls = document.querySelectorAll(".number-table-cell");
  numInputEls.forEach((el) => {
    el.addEventListener("input", (e) => {
      const datasetId = e.target.parentElement.dataset.id;
      const value = Number(e.target.value);
      if (value > 0) {
        updateQuantity(datasetId, value);
      } else {
        alert("Quality must be greater than 0");
        e.target.value = 1;
      }
    });
  });

  // select all del btns and listen
  const delBtns = document.querySelectorAll(".del-btn");
  delBtns.forEach((delBtn) => {
    delBtn.addEventListener("click", (e) => {
      const datasetId = e.target.parentElement.parentElement.dataset.id;
      showModal(datasetId);
    });
  });

  loadFooter();
};

// function to fetch the initial cartItems data from the api
async function fetchData() {
  try {
    const response = await fetch(URL);
    const data = await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

// function to format to INR
function formatINR(amount) {
  const f = new Intl.NumberFormat("en-IN");
  const inrPrice = f.format(amount);
  return inrPrice;
}

// function to display the cart items
function displayCartItems(items) {
  const mapped = items
    .map((item) => {
      const { product_id, product_title, quantity, price, image } = item;

      // create an number format obj
      const f = new Intl.NumberFormat("en-IN");
      const inrPrice = formatINR(price);
      const subTotalPrice = formatINR(price);

      return `
            <div class="cart-item table-row" data-id="${product_id}">
                <div class="img-container table-cell">
                    <img
                    src="${image}"
                    alt="not found"
                    />
                </div>
                <p class="table-cell text-grey">${product_title}</p>
                <p class="table-cell text-grey">₹${inrPrice}</p>
                <input type="number" class="table-cell number-table-cell" value="${quantity}"></input>
                <p class="subtotal-table-cell" data-id=${product_id}>₹${subTotalPrice}</p>
                <button class="table-cell del-btn">
                    <img src="./assets/icons/del.svg" />
                </button>
            </div>`;
    })
    .join("");

  const cartItemsContainer = document.querySelector(".cart-items-container");
  if (items.length === 0) {
    cartItemsContainer.innerHTML = "<h2 class='empty-msg'>Cart is empty</h2>";
  } else {
    cartItemsContainer.innerHTML = mapped;
  }
}

// function to update the quantity of the particular cart item
function updateQuantity(datasetId, value) {
  const findProductInCart = cartItems.find((item) => {
    if (item.product_id === Number(datasetId)) {
      return item;
    }
  });

  if (findProductInCart) {
    cartItems = cartItems.map((item) => {
      if (item.product_id === Number(datasetId)) {
        return { ...item, quantity: value };
      }
      return item;
    });
    setStorage("cartItems", cartItems);

    // calculate the subtotal(of the particular cart item) from the updated cart item details
    const updatedProduct = cartItems.find((product) => {
      if (product.product_id === Number(datasetId)) {
        return product;
      }
    });
    const subTotal = updatedProduct.price * updatedProduct.quantity;
    updateItemSubTotal(datasetId, subTotal);

    updateCartSubTotal();
  }
}

// function to update the subTotal of each cart item
function updateItemSubTotal(datasetId, subTotal) {
  const el = document.querySelector(
    `.subtotal-table-cell[data-id="${datasetId}"]`
  );
  el.textContent = `₹${formatINR(subTotal)}`;
}

// function to update cartSubTotal
function updateCartSubTotal() {
  const el = document.querySelector(".cart-subtotal");
  const cartTotal = document.querySelector(".cart-total");

  // calculate the cartSubtotal
  const cartSubTotal = cartItems.reduce((acc, curr) => {
    acc += curr.price * curr.quantity;
    return acc;
  }, 0);

  el.textContent = `Rs. ${formatINR(cartSubTotal)}`; // cart subtotal
  cartTotal.textContent = `Rs. ${formatINR(cartSubTotal)}`; // cart total
}

// function to close the modal
const modalContainer = document.querySelector(".modal-container");
const modalDelBtn = document.querySelector(".modal-del-btn");
const modalCancelBtn = document.querySelector(".modal-cancel-btn");
const modalOverlay = document.querySelector(".modal-overlay");

function closeModal() {
  modalContainer.classList.remove("show");
}

// function to show modal
function showModal(datasetId) {
  modalContainer.classList.add("show");
  modalDelBtn.dataset.id = datasetId;
}

// listener on modal del btn
modalDelBtn.addEventListener("click", (e) => {
  const datasetId = Number(e.target.dataset.id);

  cartItems = cartItems.filter((cartItem) => {
    if (cartItem.product_id !== datasetId) {
      return cartItem;
    }
  });

  setStorage("cartItems", cartItems); // Update local storage

  displayCartItems(cartItems);
  updateCartSubTotal();
  closeModal();
});

// listener on modal cancel btn and modal overlay
modalCancelBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

const footerData = [
  {
    id: 1,
    img: "./assets/footer-img/trophy.svg",
    title: "high quality",
    sub: "crafted from top materials",
  },
  {
    id: 2,
    img: "./assets/footer-img/guarantee.svg",
    title: "warranty protection",
    sub: "Order over 150 $",
  },
  {
    id: 3,
    img: "./assets/footer-img/shipping.svg",
    title: "free shipping",
    sub: "Over two years",
  },
  {
    id: 4,
    img: "./assets/footer-img/guarantee.svg",
    title: "24/7 support",
    sub: "dedicated support",
  },
];

const footerEl = document.querySelector(".footer");
function loadFooter() {
  const mapped = footerData
    .map((item) => {
      console.log(item);
      return `
         <div class="footer-el">
            <div class="footer-img-container">
            <img src="${item.img}" alt="not found" />
            </div>
            <div>
            <h3 class="footer-heading">${item.title}</h3>
            <p class="footer-subheading">${item.sub}</p>
            </div>
        </div>
        `;
    })
    .join("");

  footerEl.innerHTML = mapped;
}

window.addEventListener("DOMContentLoaded", init);
