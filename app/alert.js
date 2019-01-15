var utilities = window.alerts || {};

utilities.showAlert = function(alertType, params) {
    var alertMessage;
    switch(alertType) {
        case 'quantityExceeds':
            alertMessage = 'Dear Customer, the quantity of this item has been limited to 10!';
        break;
        case 'quantityZero':
            alertMessage = 'Dear Customer, you can delete this item by clicking on Remove icon on the right.';
        break;
        case 'itemRemoval':
            alertMessage = 'Dear customer, you have deleted one item from your basket.';
        break;
        case 'paymentRedirect':
            alertMessage = 'Dear customer, you total bill amount for this order is ' + param.total + '. \n Kindly select paymet method.';
        break;
    }
    var alertWindow = document.getElementById('alertBox');
    var span = document.getElementsByClassName("close-alert")[0];
    document.getElementById('alertContent').innerHTML = alertMessage;

    alertWindow.style.display = "block";

    span.onclick = function() {
        alertWindow.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == alertWindow) {
            alertWindow.style.display = "none";
        }
    }
};