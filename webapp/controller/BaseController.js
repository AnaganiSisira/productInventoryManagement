sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/export/Spreadsheet",
], (Controller, MessageToast, Spreadsheet) => {
    "use strict";

    return Controller.extend("productinventorymanagement.controller.BaseController", {
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        openFragment: function (sFragmentName) {
            if (!this._mFragments) {
                this._mFragments = {};
            }

            if (!this._mFragments[sFragmentName]) {
                this._mFragments[sFragmentName] = this.loadFragment({
                    name: sFragmentName,
                    controller: this
                });
            }

            return this._mFragments[sFragmentName].then(function (oDialog) {
                this.getView().addDependent(oDialog);
                oDialog.open();
                return oDialog;
            }.bind(this));
        },

        closeFragment: function (sFragmentName) {
            if (this._mFragments && this._mFragments[sFragmentName]) {
                this._mFragments[sFragmentName].then(function (oDialog) {
                    oDialog.close();
                });
            }
        },

        onExportToExcel: function () {
            var oTable = this.byId("idProductsTable");
            var aSelectedItems = oTable.getSelectedItems();

            var oModel = this.getView().getModel("productModel");
            var aProducts = oModel.getProperty("/Products");

            var aExportData = [];
            if (aSelectedItems.length > 0) {
                aExportData = aSelectedItems.map(function (oItem) {
                    return oItem.getBindingContext("productModel").getObject();
                });
                MessageToast.show("Exporting selected products...");
            } else {
                aExportData = aProducts;
                MessageToast.show("No selection — exporting all products...");
            }

            if (!aExportData || aExportData.length === 0) {
                MessageToast.show("No data to export.");
                return;
            }

            var oExport = new Spreadsheet({
                workbook: {
                    columns: [
                        { label: "Product Name", property: "productName" },
                        { label: "Category", property: "category" },
                        { label: "Price (₹)", property: "price" },
                        { label: "Stock Quantity", property: "stockQuantity" },
                        { label: "Supplier", property: "supplier" },
                        { label: "Last Restocked", property: "lastRestocked" }
                    ]
                },
                dataSource: aExportData,
                fileName: "Product_Inventory.xlsx"
            });

            oExport.build().then(function () {
                MessageToast.show("Excel exported successfully!");
            }).catch(function (oError) {
                MessageBox.error("Error exporting to Excel: " + oError);
            }).finally(function () {
                oExport.destroy();
            });
        },

        removeSelection: function () {
            var oTable = this.byId("idProductsTable");
            oTable.removeSelections();
            this.getView().getModel("viewModel").setProperty("/isMultiSelectActive", false);
            this.byId("bulkDeleteBtn").setVisible(false);
            this.byId("UpdateBulkPriceBtn").setVisible(false);

        }

    });
});