const productListEl = document.getElementById('product-list');
let cart = []; // 购物车数组，存所有商品

// 购物车元素
const cartItemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("cart-total");
const modal = document.querySelector(".modal-overlay");


fetch("./data.json")
  .then(response => {
    return response.json()
  }).then(products => {
    renderProductList(products)
    renderCart()  // 👈 立即渲染购物车（此时 cart 还是空的）
  }).catch(err => {
    console.log("读取失败", err)
  })

function renderProductList(products) {
  products.forEach(product => {
    productListEl.innerHTML += `  
       <div class="product-card">
        <img src="${product.image.desktop}" alt="${product.name}">

         <button class="add-to-cart-btn" data-name="${product.name}"data-price="${product.price}" >
        <img src="./assets/images/icon-add-to-cart.svg" alt="cart-icon">Add to Cart
        </button>

        <div class="quantity-controls"style="display:none;" >
        <button class="minus"><img src="./assets/images/icon-decrement-quantity.svg" ></button>
        <span>1</span>
        <button class="plus"><img src="./assets/images/icon-increment-quantity.svg" ></button>
        </div>

        <h3 class="product-category">${product.category}</h3>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
       
       </div>
       `
  })

  const minus = document.querySelectorAll(".minus")
  const plus = document.querySelectorAll(".plus")
  plus.forEach(btn => {
    btn.addEventListener("click", () => {
      //previousElementSibling 找到上一个兄弟姊妹span
      const numberSpan = btn.previousElementSibling
      //通过span找里面的数字进行加法
      numberSpan.textContent = Number(numberSpan.textContent) + 1

      // ===== 同步购物车 =====
      // ✅ 正确找到商品卡片，再找名字
      const productCard = btn.closest('.product-card')
      const name = productCard.querySelector('.product-name').textContent
      const item = cart.find(item => item.name === name)

      // JS 里什么东西会被当成 true？
      // 只要不是下面这 6 种，全都是 true：
      // undefined（没找到）
      // null（空）
      // 0（数字 0）
      // ""（空字符串）
      // false
      // NaN

      if (item) {
        item.quantity = Number(numberSpan.textContent)
      }
      renderCart(); // 重新渲染,更新cart数量到cart-item里面和计算总价

    })
  })

  minus.forEach(btn => {
    btn.addEventListener("click", () => {
      //找父亲
      const parentDiv = btn.parentElement
      //通过父亲找span
      const numberSpan = parentDiv.querySelector("span")
      //通过span找里面的数字进行减法
      numberSpan.textContent = Number(numberSpan.textContent) - 1


      // ===== 同步购物车 =====
      // ✅ 正确找到商品卡片，再找名字
      //closest()	向上	找所有祖先（包括自己）
      const productCard = btn.closest('.product-card')
      const name = productCard.querySelector('.product-name').textContent
      const item = cart.find(item => item.name === name)
      if (item) {
        if (numberSpan.textContent >= 1) {
          item.quantity = Number(numberSpan.textContent)
        } else {
          cart = cart.filter(item => item.name !== name)
          parentDiv.style.display = "none"
          parentDiv.previousElementSibling.style.display = "flex"
        }
      }
      renderCart(); // 重新渲染,更新cart数量到cart-item里面和计算总价


    })
  })

  const cartBtn = document.querySelectorAll(".add-to-cart-btn")
  cartBtn.forEach(btn => {
    btn.addEventListener("click", () => {

      //1.隐藏当前按钮
      btn.style.display = "none"
      //2.显示加减器    nextElemntSibling找到下一个兄弟姊妹
      btn.nextElementSibling.style.display = "flex"
      //3.数量起始值为1
      btn.nextElementSibling.querySelector("span").textContent = 1

      // ===== 新增：把商品加入购物车数组 =====
      //找父亲
      const parentDiv = btn.parentElement
      //通过父亲找h3里的名字
      const name = parentDiv.querySelector(".product-name").textContent
      const priceStr = parentDiv.querySelector(".product-price").textContent
      const price = Number(priceStr.replace("$", ""))
      // ======================

      ////find 方法返回的 不是布尔值（true/false）find 返回的是：找到的那个「商品对象」
      const existItem = cart.find(item => item.name === name)
      if (existItem) {
        //已有商品，数量+1
        existItem.quantity += 1;
      } else {
        // 没有 → 加入购物车数组
        cart.push({
          name: name,
          price: price,
          quantity: 1
        })
      }
      // 4. 刷新购物车界面
      renderCart()

    })
  })
}


function renderCart() {
  // 清空购物车
  cartItemsEl.innerHTML = ""
  if (cart.length === 0) {

    cartItemsEl.innerHTML += `
  <div class="empty-cart">
  <img src="./assets/images/illustration-empty-cart.svg",alt="cake-icon">
  <span>Your added items will appear here</span>
  </div>
  `
  }

  let total = 0;
  let totalCount = 0;
  // 循环数组，显示每一个商品
  cart.forEach(item => {

    let subtotal = item.price * item.quantity
    //let 不能和 += 一起用！
    total += subtotal
    totalCount += item.quantity;
    //只有反引号可以换行，用 ${变量}👍
    cartItemsEl.innerHTML += `
  <div class="cart-item">
    <div class="cart-item-info">
      <h3 class="cart-item-name">${item.name}</h3>
      <div class="cart-item-price-wrap">
        <span class="quantity">${item.quantity}x</span>
        <span class="price-single">@ $${item.price.toFixed(2)}</span>
        <h4 class="price-total">$${subtotal.toFixed(2)}</h4>
      </div>
    </div>
    <button class="cart-item-remove" data-name="${item.name}">
      <img src="./assets/images/icon-remove-item.svg" alt="remove">
    </button>
  </div>
  <div class="cart-divider"></div>
  
      `;

  })
  // 1. 计算购物车里所有商品的数量加起来
  // 2. 把数字放到页面上
  document.getElementById("cart-count").textContent = `Your Cart (${totalCount})`;

  // ==============================================
  // 👇 下面这些 只渲染一次！！！放在 forEach 外面！
  // ==============================================
  if (cart.length > 0) {
    cartItemsEl.innerHTML += `
      <div class="cart-total">
        <span>Order Total</span>
        <span id="cart-total">$${total.toFixed(2)}</span>
      </div>
      <div class="tree">
        <img src="./assets/images/icon-carbon-neutral.svg" alt="tree-icon">
        <span>This is a <b>carbon-neutral</b> delivery</span>
      </div>
      <button class="orderbtn">Confirm Order</button>
    `;
  }
  // ==========================
  // 删除按钮逻辑
  // ==========================
  const del = document.querySelectorAll(".cart-item-remove")
  del.forEach(btn => {
    btn.addEventListener("click", () => {
      // dataset.name 是专门拿 HTML 标签上 data-xxx 属性的工具！
      // data-name → JS 里写 dataset.name
      // data-price → JS 里写 dataset.price
      const nameToDelete = btn.dataset.name

      //保留所有名字 不等于 条件的商品
      cart = cart.filter(item => item.name !== nameToDelete)


      // ==============================================
      // ✅ 在这里重置【对应商品】的卡片（不是全部！）
      // ==============================================
      const allCards = document.querySelectorAll(".product-card");
      allCards.forEach(card => {
        const cardName = card.querySelector(".product-name").textContent;

        // 如果是被删除的那个商品 → 恢复按钮 + 数字归1
        if (cardName === nameToDelete) {
          card.querySelector(".quantity-controls").style.display = "none";   // 隐藏加减
          card.querySelector(".add-to-cart-btn").style.display = "flex";// 显示加入购物车 
        }
      })
      renderCart();
    })
    // ========== 弹窗逻辑 开始 ==========
    // 点击确认订单 → 显示弹窗
    const confirmBtn = document.querySelector(".orderbtn");
    const modalList = document.querySelector(".modal-list")
    modalList.innerHTML = "";
    // 遍历左边所有商品卡片
    document.querySelectorAll(".product-card").forEach(card => {
      const quantityControl = card.querySelector(".quantity-controls");

      // 只拿【已经加入购物车】的商品
      if (quantityControl.style.display === "flex") {

        // 直接拿：图片、名字、数量、价格
        const img = card.querySelector("img").src;
        const name = card.querySelector(".product-name").textContent;
        const quantity = card.querySelector(".quantity-controls span").textContent;
        const price = card.querySelector(".product-price").textContent;
        const mul = quantity * Number(price.replace("$", ""))
        // 直接放进弹窗里！
        modalList.innerHTML += `
    <div class="modal-item">      <!-- 一行商品（最外层） -->
  <div class="modal-item-left">  <!-- 左边：图片 + 文字 -->
    <img src="${img}" class="modal-item-img">
    <div class="modal-except-img">
      <h4 class="modal-item-name">${name}</h4>
      <div class="modal-item-info">
        <span class="quantity-form">${quantity}x</span>
        <span class="price-form">@${price}</span>
      </div>
    </div>
  </div>
<div class="modal-item-left"> 
<span>$${mul.toFixed(2)}</span>
</div>
 </div>
 <div class="form-divider"></div>
    `
      }
    });

    // 商品列表循环结束后，加这一行
    modalList.innerHTML += `
  <div class="modal-total-row">
    <span class="modal-total-label">Order Total</span>
    <span class="modal-total-value">$${total.toFixed(2)}</span>
  </div>
`; 



    confirmBtn.addEventListener("click", () => {
      modal.style.display = "flex";

    })
    // 3. 点击 Start New Order → 重置 + 关闭弹窗
    const resetBtn = document.querySelector(".reset-btn");
    resetBtn.addEventListener("click", () => {

      cart = [] //清空数组

      document.querySelectorAll(".product-card").forEach(card => {
        card.querySelector(".quantity-controls").style.display = "none";
        card.querySelector(".add-to-cart-btn").style.display = "flex";
      });

      modal.style.display = "none";
      renderCart()
    })
    // 4. 点击空白处关闭弹窗

    // 点在灰色遮罩上→ e.target = .modal-overlay
    // 点在白色弹窗内容上→ e.target = 里面的文字 / 按钮 / 图片
    // e = 你点击的那个东西（事件对象）
    // e.target= 你真正点到的那个 HTML 元素 !!!

    modal.onclick = function (e) {
      if (e.target === modal) {
        cart = [] //清空数组

      document.querySelectorAll(".product-card").forEach(card => {
        card.querySelector(".quantity-controls").style.display = "none";
        card.querySelector(".add-to-cart-btn").style.display = "flex";
      });

      modal.style.display = "none";
      renderCart()
      }
    };




  })
  if (totalPriceEl) {
    totalPriceEl.textContent = `$${total.toFixed(2)}`;
  }
}

