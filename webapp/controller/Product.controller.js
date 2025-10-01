sap.ui.define([
    "productinventorymanagement/controller/BaseController",
    "productinventorymanagement/model/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], (BaseController, formatter, MessageToast, Filter, FilterOperator, Sorter) => {
    "use strict";

    return BaseController.extend("productinventorymanagement.controller.Product", {
        formatter: formatter,
        onInit() {
            this.getRouter().getRoute("RouteProduct").attachPatternMatched(this.RouteProductMatched, this);
        },

        RouteProductMatched: function () {
            this._oCurrentP13nData = null;
            this.getOwnerComponent().getModel("viewModel")
            this._bIsOpen = false;
        },

        _initialData: {
            sort: [
                { sorted: false, name: "productName", label: "Product", descending: false },
                { sorted: false, name: "price", label: "Price", descending: false },
                { sorted: false, name: "stockQuantity", label: "Stock Quantity", descending: false },
                { sorted: false, name: "category", label: "Category", descending: false },
                { sorted: false, name: "supplier", label: "Supplier", descending: false },
                { sorted: false, name: "lastRestocked", label: "Last Restocked", descending: false }
            ],
            group: [
                { grouped: false, name: "category", label: "Category" },
                { grouped: false, name: "supplier", label: "Supplier" }
            ]
        },


        _setInitialData: function () {
            var oView = this.getView();
            var oSortPanel = oView.byId("sortPanel");
            var oGroupPanel = oView.byId("groupPanel");


            oSortPanel.setP13nData(this._initialData.sort);
            oGroupPanel.setP13nData(this._initialData.group);
        },

        onPersoButtonPressed: function (oEvt) {
            var oView = this.getView();
            var oPopup = oView.byId("sorter");
            if (!this._bIsOpen) {
                this._setInitialData();
                this._bIsOpen = true;
            }

            oPopup.open(oEvt.getSource());
        },


        // onClose: function (oEvt) {
        //     var sReason = oEvt.getParameter("reason");
        //     MessageToast.show("Dialog close reason: " + sReason);
        // },

        onClose: function (oEvt) {
            var sReason = oEvt.getParameter("reason");
            MessageToast.show("Dialog close reason: " + sReason);

            if (sReason === "Ok") {
                var oView = this.getView();
                var oTable = oView.byId("idProductsTable");

                var aSorters = [];
                var aGroupers = [];

                var aSortData = oView.byId("sortPanel").getP13nData();
                var aGroupData = oView.byId("groupPanel").getP13nData();

                aSortData.forEach(function (oEntry) {
                    if (oEntry.sorted) {
                        aSorters.push(new Sorter(oEntry.name, oEntry.descending));
                    }
                });

                aGroupData.forEach(function (oEntry) {
                    if (oEntry.grouped) {
                        aGroupers.push(new Sorter(oEntry.name, false, true));
                    }
                });
                var oBinding = oTable.getBinding("items");

                if (oBinding) {
                    var aFinalSorters = [].concat(aGroupers, aSorters);
                    oBinding.sort(aFinalSorters);
                }
            }
        },


        reset: function (oEvt) {
            this._setInitialData();
            this.parseP13nState();
        },

        parseP13nState: function (oEvt) {
            if (oEvt) {
                MessageToast.show("P13n panel change reason:" + oEvt.getParameter("reason"));
            }
            var oView = this.getView();
            var oEditor = oView.byId("p13nEditor");

            var oP13nState = {
                sort: oView.byId("sortPanel").getP13nData(),
                group: oView.byId("groupPanel").getP13nData()
            };

            oEditor.setValue(JSON.stringify(oP13nState, null, '  '));
        },

       
        onRestockFilterChange: function (oEvent) {
            var bSelected = oEvent.getParameter("selected"); 
            var oTable = this.getView().byId("idProductsTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                if (bSelected) {
                    var oFilter = new Filter("stockQuantity", FilterOperator.LT, 10);
                    oBinding.filter([oFilter]);
                } else {
                    oBinding.filter([]);
                }
            }
        }




    });
});