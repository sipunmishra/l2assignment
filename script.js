let menuebar = document.querySelector(".menuebar");
let cross = document.querySelector(".cross");
menuebar.addEventListener("click", () => {
    document.querySelector(".navside").style.display = "block";
})
cross.addEventListener("click", () => {
    document.querySelector(".navside").style.display = "none";
    document.querySelector(".navside").style.transition = "3s";
})

document.addEventListener("DOMContentLoaded", () => {
    const apiURL = "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889";
    const cartItemsContainer = document.querySelector('.cartItems');
    const subtotalElement = document.querySelector('.cartTotal div div:first-child h2:last-child');
    const totalElement = document.querySelector('.cartTotal div div:nth-child(2) h2:last-child');
    const loader = document.querySelector('.loader');

    showLoader();

    setTimeout(() => {
        fetch(apiURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const items = data.items;
                let subtotal = 0;
    
                items.forEach(item => {
                    subtotal += item.price * item.quantity;
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('item');
                    itemElement.innerHTML = `
                        <img src="${item.image}" alt="${item.title}">
                        <h2>${item.title}</h2>
                        <h2>₹${item.price / 100}</h2>
                        <input type="number" name="qty" value="${item.quantity}" min="1">
                        <h2>₹${(item.price * item.quantity) / 100}</h2>
                        <i class='bx bx-trash' data-id="${item.id}"></i>
                    `;
                    cartItemsContainer.appendChild(itemElement);
                });
    
                subtotalElement.textContent = `₹${subtotal / 100}`;
                totalElement.textContent = `₹${subtotal / 100}`;
    
                saveCartToLocalStorage(items);
                hideLoader();
    
                document.querySelectorAll('.item input[name="qty"]').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const itemId = e.target.nextElementSibling.nextElementSibling.dataset.id;
                        const newQuantity = parseInt(e.target.value);
                        updateItemQuantity(itemId, newQuantity);
                    });
                });
    
                document.querySelectorAll('.item .bx-trash').forEach(trashIcon => {
                    trashIcon.addEventListener('click', (e) => {
                        const itemId = e.target.dataset.id;
                        confirmRemoveItem(itemId);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching the cart data:', error);
                hideLoader();
            });
    }, 5000);

    function updateItemQuantity(itemId, newQuantity) {
        const item = document.querySelector(`.item .bx-trash[data-id="${itemId}"]`).parentElement;
        const price = parseInt(item.querySelector('h2:nth-child(3)').textContent.replace('₹', '')) * 100;
        const newSubtotal = price * newQuantity;

        item.querySelector('h2:nth-child(5)').textContent = `₹${newSubtotal / 100}`;

        let total = 0;
        document.querySelectorAll('.item').forEach(item => {
            const quantity = parseInt(item.querySelector('input[name="qty"]').value);
            const itemPrice = parseInt(item.querySelector('h2:nth-child(3)').textContent.replace('₹', '')) * 100;
            total += itemPrice * quantity;
        });

        subtotalElement.textContent = `₹${total / 100}`;
        totalElement.textContent = `₹${total / 100}`;

        saveCartToLocalStorage(getCurrentCartItems());
    }

    function removeItem(itemId) {
        const item = document.querySelector(`.item .bx-trash[data-id="${itemId}"]`).parentElement;
        item.remove();

        let total = 0;
        document.querySelectorAll('.item').forEach(item => {
            const quantity = parseInt(item.querySelector('input[name="qty"]').value);
            const itemPrice = parseInt(item.querySelector('h2:nth-child(3)').textContent.replace('₹', '')) * 100;
            total += itemPrice * quantity;
        });

        subtotalElement.textContent = `₹${total / 100}`;
        totalElement.textContent = `₹${total / 100}`;

        saveCartToLocalStorage(getCurrentCartItems());
    }

    function confirmRemoveItem(itemId) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <p>Are you sure you want to remove this item?</p>
                <button class="confirm-btn">Yes</button>
                <button class="cancel-btn">No</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            removeItem(itemId);
            document.body.removeChild(modal);
        });

        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    function saveCartToLocalStorage(cartItems) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    function getCartFromLocalStorage() {
        const cartItems = localStorage.getItem('cartItems');
        return cartItems ? JSON.parse(cartItems) : [];
    }

    function getCurrentCartItems() {
        const items = [];
        document.querySelectorAll('.item').forEach(item => {
            const id = item.querySelector('.bx-trash').dataset.id;
            const title = item.querySelector('h2').textContent;
            const price = parseInt(item.querySelector('h2:nth-child(3)').textContent.replace('₹', '')) * 100;
            const quantity = parseInt(item.querySelector('input[name="qty"]').value);
            items.push({ id, title, price, quantity });
        });
        return items;
    }

    function showLoader() {
        loader.style.display = 'block';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    document.querySelector('.checkout').addEventListener('click', () => {
        alert('Proceed to Checkout');
    });
});