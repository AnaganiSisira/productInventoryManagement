sap.ui.define([
    "sap/ui/core/library"
], function (coreLibrary) {
    "use strict";
    var ValueState = coreLibrary.ValueState;

    return {
        quantityState: function (iValue) {
            if (iValue < 10) {
                return ValueState.Error;
            } else if (iValue >= 10 && iValue <= 50) {
                return ValueState.Warning;
            } else {
                return ValueState.Success;
            }
        },

        rowTotalValue: function (price, qty) {
            price = parseFloat(price) || 0;
            qty = parseFloat(qty) || 0;
            return price * qty;
        },

        newPrice: function (price, individualPercent) {
            return (price + (price * individualPercent / 100)).toFixed(2);
        },
        formatDate(date) {
    // Ensure the input is a valid Date object
    if (!(date instanceof Date) || isNaN(date)) {
        return null; // or an empty string, depending on requirements
    }

    // Get year, month, and day
    const year = date.getFullYear();
    // getMonth() is 0-indexed, so we add 1.
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Combine into yyyy-MM-dd format
    return `${year}-${month}-${day}`;
}


    };
});