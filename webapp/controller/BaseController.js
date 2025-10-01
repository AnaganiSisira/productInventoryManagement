sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("productinventorymanagement.controller.BaseController", {
       getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },
    });
});