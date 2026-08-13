const API_URL =
    "https://script.google.com/macros/s/AKfycbxk0SGqR3FZ9mVj1KgGHbrRPpwiM7TT1DZtnvHnvE5BWJIK6Wjmnodh89ZEx_i6cUWzDg/exec";


let products = [];

let cart = [];



/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

    try {

        const response =
            await fetch(
                API_URL +
                "?action=products"
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load products."
            );

        }


        products =
            data.products;


        displayProducts();


    }

    catch (error) {

        console.error(error);


        document
            .getElementById(
                "loading"
            )
            .classList
            .add("d-none");


        const errorBox =
            document.getElementById(
                "error"
            );


        errorBox.classList.remove(
            "d-none"
        );


        errorBox.innerText =
            "Unable to load products. " +
            error.message;

    }

}



/* =========================================
   DISPLAY PRODUCTS
========================================= */

function displayProducts() {

    const container =
        document.getElementById(
            "productList"
        );


    document
        .getElementById(
            "loading"
        )
        .classList
        .add("d-none");


    container.innerHTML = "";


    products.forEach(
        product => {


            const outOfStock =
                product.stock <= 0;


            const image =
                product.image &&
                product.image !== "Image"
                    ? product.image
                    : "https://placehold.co/600x400?text=" +
                      encodeURIComponent(
                          product.name
                      );


            container.innerHTML += `

                <div class="col-6 col-md-4 col-lg-3">

                    <div class="card product-card shadow-sm">

                        <img
                            src="${escapeHTML(image)}"
                            class="product-image"
                            alt="${escapeHTML(product.name)}"
                        >


                        <div class="card-body d-flex flex-column">

                            <small class="text-muted">
                                ${escapeHTML(product.category)}
                            </small>


                            <h5 class="card-title mt-1">
                                ${escapeHTML(product.name)}
                            </h5>


                            <p class="text-muted small">

                                ${escapeHTML(
                                    product.description
                                )}

                            </p>


                            <div class="mt-auto">

                                <div class="product-price mb-3">

                                    ₹${formatMoney(
                                        product.price
                                    )}

                                </div>


                                ${
                                    outOfStock

                                    ?

                                    `<button
                                        class="btn btn-secondary w-100"
                                        disabled
                                    >
                                        Out of Stock
                                    </button>`

                                    :

                                    `<button
                                        class="btn btn-primary w-100"
                                        onclick="addToCart('${escapeJS(product.id)}')"
                                    >
                                        🛒 Add to Cart
                                    </button>`

                                }

                            </div>

                        </div>

                    </div>

                </div>

            `;

        }
    );

}



/* =========================================
   ADD TO CART
========================================= */

function addToCart(
    productId
) {

    const product =
        products.find(
            p =>
                p.id === productId
        );


    if (!product) {
        return;
    }


    const existing =
        cart.find(
            item =>
                item.id === productId
        );


    if (existing) {

        if (
            existing.quantity <
            product.stock
        ) {

            existing.quantity++;

        }

    }

    else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

            price:
                product.price,

            stock:
                product.stock,

            quantity:
                1

        });

    }


    updateCart();


    showToast(
        "Added to cart"
    );

}



/* =========================================
   UPDATE CART
========================================= */

function updateCart() {

    const count =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.quantity,
            0
        );


    document
        .getElementById(
            "cartCount"
        )
        .innerText =
            count;


    const container =
        document.getElementById(
            "cartItems"
        );


    if (cart.length === 0) {

        container.innerHTML = `

            <div class="text-center py-4">

                <h5>
                    Your cart is empty
                </h5>

            </div>

        `;


        document
            .getElementById(
                "cartTotal"
            )
            .innerText =
                "0";


        return;

    }


    let total = 0;


    container.innerHTML = "";


    cart.forEach(
        (item, index) => {


            const amount =
                item.price *
                item.quantity;


            total += amount;


            container.innerHTML += `

                <div class="d-flex justify-content-between align-items-center border-bottom py-3">

                    <div>

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <br>

                        ₹${formatMoney(item.price)}

                    </div>


                    <div class="cart-quantity">

                        <button
                            class="btn btn-outline-secondary"
                            onclick="changeQuantity(${index}, -1)"
                        >
                            −
                        </button>


                        <strong>
                            ${item.quantity}
                        </strong>


                        <button
                            class="btn btn-outline-secondary"
                            onclick="changeQuantity(${index}, 1)"
                        >
                            +
                        </button>

                    </div>


                    <div>

                        <strong>
                            ₹${formatMoney(amount)}
                        </strong>

                    </div>


                    <button
                        class="btn btn-sm btn-danger"
                        onclick="removeFromCart(${index})"
                    >
                        ×
                    </button>

                </div>

            `;

        }
    );


    document
        .getElementById(
            "cartTotal"
        )
        .innerText =
            formatMoney(total);

}



/* =========================================
   CHANGE QUANTITY
========================================= */

function changeQuantity(
    index,
    amount
) {

    const item =
        cart[index];


    if (!item) {
        return;
    }


    const newQuantity =
        item.quantity +
        amount;


    if (
        newQuantity <= 0
    ) {

        cart.splice(
            index,
            1
        );

    }

    else if (
        newQuantity <=
        item.stock
    ) {

        item.quantity =
            newQuantity;

    }


    updateCart();

}



/* =========================================
   REMOVE CART ITEM
========================================= */

function removeFromCart(
    index
) {

    cart.splice(
        index,
        1
    );


    updateCart();

}



/* =========================================
   OPEN CART
========================================= */

function openCart() {

    updateCart();


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "cartModal"
            )
        );


    modal.show();

}



/* =========================================
   CHECKOUT
========================================= */

function checkout() {

    if (
        cart.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    const cartModal =
        bootstrap.Modal.getInstance(
            document.getElementById(
                "cartModal"
            )
        );


    if (cartModal) {
        cartModal.hide();
    }


    const checkoutModal =
        new bootstrap.Modal(
            document.getElementById(
                "checkoutModal"
            )
        );


    checkoutModal.show();

}



/* =========================================
   PLACE ORDER
========================================= */

async function placeOrder() {

    if (
        cart.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    const name =
        document
            .getElementById(
                "customerName"
            )
            .value
            .trim();


    const mobile =
        document
            .getElementById(
                "customerMobile"
            )
            .value
            .trim();


    const address =
        document
            .getElementById(
                "customerAddress"
            )
            .value
            .trim();


    if (
        !name ||
        !mobile ||
        !address
    ) {

        alert(
            "Please enter your name, mobile number and address."
        );

        return;

    }


    const button =
        document.getElementById(
            "placeOrderButton"
        );


    button.disabled =
        true;


    button.innerText =
        "Processing...";


    try {


        const response =
            await fetch(
                API_URL,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "createOrder",

                            customer: {

                                name:
                                    name,

                                mobile:
                                    mobile,

                                address:
                                    address

                            },

                            items:
                                cart.map(
                                    item => ({

                                        id:
                                            item.id,

                                        name:
                                            item.name,

                                        price:
                                            item.price,

                                        quantity:
                                            item.quantity

                                    })
                                )

                        })

                }
            );


        const result =
            await response.json();


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Order failed."
            );

        }


        /*

          WhatsApp will be added
          after we finish testing
          the Google Sheet order save.

        */

        alert(

            "Order created successfully!\n\n" +

            "Order ID: " +
            result.orderId

        );


        cart = [];


        updateCart();


        document
            .getElementById(
                "customerName"
            )
            .value = "";


        document
            .getElementById(
                "customerMobile"
            )
            .value = "";


        document
            .getElementById(
                "customerAddress"
            )
            .value = "";


    }

    catch (error) {

        console.error(error);


        alert(
            "Unable to place order.\n\n" +
            error.message
        );

    }


    button.disabled =
        false;


    button.innerText =
        "📤 Send Order to WhatsApp";

}



/* =========================================
   MONEY FORMAT
========================================= */

function formatMoney(
    value
) {

    return Number(
        value
    ).toLocaleString(
        "en-IN"
    );

}



/* =========================================
   BASIC HTML ESCAPE
========================================= */

function escapeHTML(
    value
) {

    return String(
        value
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}



/* =========================================
   JAVASCRIPT STRING ESCAPE
========================================= */

function escapeJS(
    value
) {

    return String(
        value
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    );

}



/* =========================================
   SIMPLE TOAST
========================================= */

function showToast(
    message
) {

    // Simple temporary notification

    const toast =
        document.createElement(
            "div"
        );


    toast.innerText =
        "✅ " +
        message;


    toast.style.position =
        "fixed";


    toast.style.bottom =
        "20px";


    toast.style.right =
        "20px";


    toast.style.background =
        "#198754";


    toast.style.color =
        "#fff";


    toast.style.padding =
        "12px 18px";


    toast.style.borderRadius =
        "8px";


    toast.style.zIndex =
        "9999";


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => toast.remove(),
        2000
    );

}



/* =========================================
   START
========================================= */

loadProducts();