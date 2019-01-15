var app = window.app || {};

app.init = function() {

    // Declare model objects
    var subTotal = 0,
    taxAmount = 0,
    totalAmount = 0,
    basket = [];

    /* function To query all DOM elements at once for reusability */
    app.getDOMNodes = function() {
        basketContainer = document.getElementById('basketItems');
        subTotalNode = document.getElementById('subTotal');
        taxAmountNode = document.getElementById('taxAmount');
        totalAmountNode = document.getElementById('totalAmount');
        checkoutButton = document.getElementById('checkout');
    };

    /* function to initialize model basket object & DOM as user navigates into basket page */
    app.initializeBasket = function(response) {
        localStorage.setItem('products', response); //create a local storage object from JSON resp

        var thisTemplate = '';
        basket = JSON.parse(response);
        
        // loop through the local storage obj to construct html for basket items
        for (product in basket.products) {
            thisProduct = basket.products[product];

            thisTemplate += '<div id="basketItem_' + thisProduct.id + '" class="basket-item" role="listitem" aria-level="3" aria-haspopup="false">';
            thisTemplate += '   <div class="basket-item-detail product"><span class="product-name">' + thisProduct.displayName + '</span><span class="size">' + thisProduct.size + '</span></div>';
            thisTemplate += '    <div class="basket-item-detail price">' + thisProduct.price + '</div>';
            thisTemplate += '    <div class="basket-item-detail quantity">';
            thisTemplate += '        <input id="quantityOf_' + thisProduct.id + '" data-productid="' + thisProduct.id + '" type="number" class="quantity-value" min="0" max="10" value="' + thisProduct.quantity + '" role="alert" aria-live="assertive">';
            thisTemplate += '        <button class="increment" data-id="' + thisProduct.id + '" aria-controls="number" onclick="app.updateQuantity()">+</button>';
            thisTemplate += '        <button class="decrement" data-id="' + thisProduct.id + '" aria-controls="number" onclick="app.updateQuantity()">-</button>';
            thisTemplate += '    </div>';
            thisTemplate += '    <div class="basket-item-detail total" id="totalOf_' + thisProduct.id + '">' + thisProduct.price + '</div>';
            thisTemplate += '    <div data-productid="' + thisProduct.id + '" class="basket-item-detail remove" onclick="app.removeItem(' + product + ')" role="button" aria-label="Click here to remove this item">';
            thisTemplate += '        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path d="M12 38c0 2.21 1.79 4 4 4h16c2.21 0 4-1.79 4-4V14H12v24zM38 8h-7l-2-2H19l-2 2h-7v4h28V8z"/></svg>';
            thisTemplate += '    </div>';
            thisTemplate += '</div>';
        }

        basketContainer.innerHTML = thisTemplate; // insert above html into DOM
        
        app.updateTotals.call(basket);

        // add change event for all quantity input controls
        var quantityControls = document.querySelectorAll('.quantity-value'); 
        for(var i = 0; i < quantityControls.length; i++) {
            quantityControls[i].addEventListener('change', function(event) {
                app.updateBasket(event.target.dataset.productid, event.target.value);
            })
        }
    }

    /* updates quantity in number input model on every + and - button trigger */
    app.updateQuantity = function() {
        var thisItem = document.getElementById('quantityOf_' + event.target.dataset.id);

        if(event.target.innerHTML == '+' && thisItem.value < 10) {
            thisItem.stepUp();
        }
        else if(event.target.innerHTML == '-' && thisItem.value > 1) {
            thisItem.stepDown();
        }
        else if(thisItem.value == 1 || thisItem.value == 10) {
            utilities.showAlert('quantityExceeds');
        }

        thisItem.dispatchEvent(new Event("change"));
    }

    /* updates basket items and details post every change in quantity */
    app.updateBasket = function(productId, productQuantity) {

        // filter current target basket item [qty, cost]
        var thisQuantity = document.getElementById('quantityOf_' + productId);
        var thisCost = document.getElementById('totalOf_' + productId);

        basket = JSON.parse(localStorage.getItem('products'));

        thisItem = basket.products[basket.products.map(function(product) {return product.id; }).indexOf(productId)];

        // validate allowable quantity from user input
        if(productQuantity >= 1 && productQuantity <= 10) {
            thisItem.quantity = productQuantity;
        } else if (productQuantity <= 1 ) {
            thisQuantity.value = thisItem.quantity = 1;
            utilities.showAlert('quantityZero');
        } else if (productQuantity > 10 ) {
            thisQuantity.value = thisItem.quantity;
            utilities.showAlert('quantityExceeds');
        }

        thisCost.innerHTML = (thisItem.price * thisItem.quantity).toFixed(2); //calc item total

        app.updateTotals.call(basket);

        localStorage.setItem('products', JSON.stringify(basket));
    };

    /* To remove a target item from DOM & Model */
    app.removeItem = function(index) {
        var deleteConfirmation = confirm("This item will be removed from your basket, \nDo you want to continue?");
        if (deleteConfirmation == true) {
            basket = JSON.parse(localStorage.getItem('products'));

            var targetId = event.target.closest(".basket-item-detail.remove").dataset.productid;
            var targetElement = document.getElementById('basketItem_' + targetId);

            // filteringn target model-object & DOM element to remove
            targetElement.parentNode.removeChild(targetElement);
            basket.products = basket.products.filter(function(product) {
                return product.id != targetId;
            })

            app.updateTotals.call(basket);

            // disabling checkout features on empty basket condition
            if(basket.products.length <= 0) {
                checkoutButton.disabled = true;
                checkoutButton.setAttribute("aria-disabled", "true");
                basketContainer.innerHTML = '<div class="basket-item-detail empty-cart" role="alert" aria-live="assertive">Cart empty! Please add items to continue.</div>';
            }
            
            localStorage.setItem('products', JSON.stringify(basket));
        }
    }

    /* Updates basket summary section with every change in basket */
    app.updateTotals = function() {
        var thisTotal = 0;

        // calc raw total of basket items in model obj
        for (item in this.products) {
            //thisItem = this.products[item];
            thisTotal = thisTotal + (this.products[item].price * parseInt(this.products[item].quantity));
        }

        // calc summary details & set value in DOM
        subTotal = thisTotal;
        taxAmount = (subTotal * 20) / 100;
        totalAmount = subTotal + taxAmount;

        subTotalNode.innerHTML = basket.subTotal = subTotal.toFixed(2);
        taxAmountNode.innerHTML = basket.tax = taxAmount.toFixed(2);
        totalAmountNode.innerHTML = basket.total = totalAmount.toFixed(2);
    };

    /* Initate checkout from current basket state */
    app.checkout = function() {
        basket.checkoutTimestamp = new Date();
        ajaxCall.initate('POST', 'https://temp.revonic.com/basketapi', app.checkoutResult, basket);
    }
    
    /* Checkout items and navigate to payment page || anyother checkout actions */
    app.checkoutResult = function(acknowledgement) {
        utilities.showAlert('paymentRedirect', acknowledgement);
    }

    /* Triggers custom alert messages */
    

    app.getDOMNodes();
    ajaxCall.initate('GET', '/data/products.json', app.initializeBasket, {}); // To initialize basket page
};

app.init();