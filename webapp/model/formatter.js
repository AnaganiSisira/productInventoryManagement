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
        }


    };
});