///// Show name and gold balance
const showGoldBalance = function () {

    document.getElementById('gold-balance').innerText = `${service.user.balance} gold`;

};

const showUserName = function () {

    document.getElementById('user-name').innerText = `${service.user.login}`;

};

document.addEventListener('DOMContentLoaded', showGoldBalance());
document.addEventListener('DOMContentLoaded', showUserName());

///// Show available stock
// UI variables
const container = document.getElementById('stock');
const productsList = document.querySelector('.products__list');
const currentStock = service.items;

currentStock.forEach(item => {
    container.insertAdjacentHTML('beforeend', 
    `<li class="dashboard__item">
        <img src="images/${item.filename}.png" class="item__image" alt="A ${item.name}"/>
        <div class="item__info">
            <p class="item__name">${item.name}</p>
            <p class="item__quantity" data-item-id="${item.id}">Quantity: ${item.quantity}</p>
        </div>
    </li>`);
    
    // Load the market as if it was not defined in the HTML
    productsList.insertAdjacentHTML('beforeend',
    `<li class="products__item">
        <div class="item__container">
            <div class="item__info">
                <img src="images/${item.filename}.png" class="item__image">
                <h4 class="item__name">${item.name}</h4>
            </div>
            <div class="item__actions" data-item-id="${item.id}">
                <button class="item__decrease">-</button>
                <input type="number" name="item__quantity" class="item__quantity" value="0" min="0" max="${item.quantity}" data-item-id="${item.id}">
                <button class="item__increase">+</button>	
            </div>
            <span class="item__cost">0 gold</span>
        </div>
    </li>`);
});

const updateAvailableStock = function () {

    const productsList = document.querySelectorAll('.dashboard [data-item-id]');

    for (i = 0; i < productsList.length; i++) {

        if (productsList[i].dataset.itemId == currentStock[i].id) {
            productsList[i].innerText = `Quantity: ${currentStock[i].quantity}`;
        } else {
            return;
        }

    };
};

///// Modal functionality
// UI variables
const openModalButtons = document.querySelectorAll('[data-modal-target]');
const closeModalButtons = document.querySelectorAll('[data-close-button]');
const overlay = document.querySelector('.overlay');

const openModal = function(modal) {

    if (modal == null) {
        return;
    } else {
        modal.classList.add('active');
        overlay.classList.add('active');
    }
};

const closeModal = function(modal) {
    if (modal == null) {
        return;
    } else {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }
};

openModalButtons.forEach(button => {

    button.addEventListener('click', () => {

        // Detect, from the clicked button, which modal will be opened
        const modal = document.querySelector(button.dataset.modalTarget);
        openModal(modal);
    });

});

closeModalButtons.forEach(button => {

    button.addEventListener('click', () => {

        const modal = button.closest('.modal');
        closeModal(modal);
    });
});

// Close the modal by clicking the overlay
overlay.addEventListener('click', () => {

    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        closeModal(modal);
    });
});


///// Market operations
// UI Variables
const quantityIncreaseButtons = document.querySelectorAll('.item__increase');
const quantityDecreaseButtons = document.querySelectorAll('.item__decrease');
const itemQuantityInputs = document.querySelectorAll('.market .item__quantity');

const disableButtons = function () {

    quantityIncreaseButtons.forEach(button => {
        button.classList.add('btn--disabled');
        button.disabled = true;
    });

    document.querySelector('.market .action__buy').classList.add('btn--disabled');
    document.querySelector('.market .action__buy').disabled = true;

};

const enableButtons = function () {

    quantityIncreaseButtons.forEach(button => {
        button.classList.remove('btn--disabled');
        button.disabled = false;
    });
    document.querySelector('.market .action__buy').classList.remove('btn--disabled');
    document.querySelector('.market .action__buy').disabled = false;
};

const showWarning = function (warningType) {

    switch(warningType) {
        case 'exceededBalance':
            document.querySelector('.warning__text').innerText = `The total cost exceeds your current gold balance.`;
            document.querySelector('.market__warnings').classList.remove('hidden');
            break;
        case 'notEnoughStock':
            document.querySelector('.warning__text').innerText = `You have reached the maximum stock quantity for this item.`;
            document.querySelector('.market__warnings').classList.remove('hidden');
            break;
        case 'failedProcess':
            console.log('process failed');
            break;
        default:
            console.log('default');
    }

}

const updateItemCost = function (itemQuantity, itemId) {

    // Because itemId arrives as a string from the object
    itemId = Number(itemId);

    let updatedPrice;

    currentStock.forEach(item => {
        if(item.id === itemId) {
            updatedPrice = itemQuantity * item.price;
        }
    });

    return updatedPrice;
};

const checkTotalCostDoesNotExceedBalance = function (totalCost) {

    if (totalCost <= service.user.balance) {
        if(document.querySelector('.market__warnings')) {

            // If total cost comes down back to current balance, remove warning
            document.querySelector('.market__warnings').classList.add('hidden');

            enableButtons();
        }
        return;
    } else {        
        showWarning('exceededBalance');
        disableButtons();
    }

};

const checkAvailableStock = function (itemQuantity, itemId) {

    // Because itemId arrives as a string from the object
    itemId = Number(itemId);
    
    // Get item's available stock
    let availableStock = 0;

    currentStock.forEach(item => {

        if(item.id === itemId) {
            availableStock = item.quantity;
        }

    });

    if (itemQuantity <= availableStock) {
        enableButtons();
        return true;
    } else {
        disableButtons();
        return false;
    }

};

const updateTotalCost = function () {

    let totalCost = 0;
    
    document.querySelectorAll('.item__cost').forEach(cost => {

        totalCost += Number(cost.innerText.slice(0, -5));

    });

    document.querySelector('.total__value').innerText = `${totalCost} gold`;

    checkTotalCostDoesNotExceedBalance(totalCost);

};

const resetQuantities = function() {

    itemQuantityInputs.forEach(input => {

        input.value = 0;

        document.querySelectorAll('.market .item__cost').forEach(totalItemCost => {

            totalItemCost.innerText = '0 gold';

        });

        updateTotalCost();

    });

};

// Typing any quantity updates the costs
itemQuantityInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        let itemId = e.target.parentElement.dataset.itemId;
        let itemQuantity = e.target.value;
        let updatedPrice = updateItemCost(itemQuantity, itemId);
        e.target.parentElement.nextElementSibling.innerText = `${updatedPrice} gold`;
        updateTotalCost();
    });
});

quantityIncreaseButtons.forEach(button => {

    button.addEventListener('click', (e) => {

        // Identify and save the pressed button in order to have a better context of where and which inputs/values to update
        const pressedButton = e.target;

        // Save the item's ID to find the price
        const itemId = pressedButton.parentElement.dataset.itemId;
      
        pressedButton.previousElementSibling.value++;

        // Save the newly updated item quantity
        let itemQuantity = pressedButton.previousElementSibling.value;

        if (checkAvailableStock(itemQuantity, itemId) === true) {
            
            let totalItemCost = updateItemCost(itemQuantity, itemId);

            pressedButton.parentElement.nextElementSibling.innerText = `${totalItemCost} gold`;

            updateTotalCost();

        } else {
            showWarning('notEnoughStock');
        }

    });

});

quantityDecreaseButtons.forEach(button => {

    button.addEventListener('click', (e) => {

        // Identify and save the pressed button in order to have a better context of where and which inputs/values to update
        const pressedButton = e.target;

        // Save the item's ID to find the price
        const itemId = pressedButton.parentElement.dataset.itemId;

        if (button.nextElementSibling.value <= 0) {
            return;
        } else {
            button.nextElementSibling.value--;
        }

        // Save the newly updated item quantity
        let itemQuantity = pressedButton.nextElementSibling.value;

        if (checkAvailableStock(itemQuantity, itemId)) {
            let totalItemCost = updateItemCost(itemQuantity, itemId);

            pressedButton.parentElement.nextElementSibling.innerText = `${totalItemCost} gold`;
    
            updateTotalCost();

        } else {
            showWarning('notEnoughStock');
        }

    });

});
const buyItems = function () {
    
    // Update available stock
    let finalItems = document.querySelectorAll('.market .item__quantity');
    
    for (i = 0; i < finalItems.length; i++) {

        // Validate that the items are the same
        if (currentStock[i].id == finalItems[i].dataset.itemId) {

            // Substract the bought amount
            currentStock[i].quantity -= finalItems[i].value;
        } else {
            return;
        }
    }

    updateAvailableStock();

    // Update gold balance
    let finalGold = Number(document.querySelector('.market .total__value').innerText.slice(0, -5));
    service.user.balance -= finalGold;
    showGoldBalance();

    closeModal(this.closest('.modal'));

};

document.querySelector('.market .action__buy').addEventListener('click', buyItems);
document.querySelector('.action__reset').addEventListener('click', resetQuantities);