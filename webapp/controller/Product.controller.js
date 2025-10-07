sap.ui.define([
    "productinventorymanagement/controller/BaseController",
    "productinventorymanagement/model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter"
], (BaseController, formatter, MessageToast, MessageBox, Filter, FilterOperator, Fragment, Sorter) => {
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
                    this.byId("addRestock").setVisible(true);
                } else {
                    oBinding.filter([]);
                    this.byId("addRestock").setVisible(false);   
                    this.removeSelection();            
                }
            }
        },

        onCancelProduct: function () {
            this.closeFragment("productinventorymanagement.view.AddProduct");
        },

        onAddProduct: function () {
            var oView = this.getView();
            var oCreateModel = oView.getModel("createModel");

            oCreateModel.setData({
                ProductName: "",
                Category: "",
                Price: 0,
                Stock: 0,
                Supplier: "",
                LastRestocked: null
            });

            if (!this._oDialog) {
                  this.openFragment("productinventorymanagement.view.AddProduct");
                oView.addDependent(this._oDialog);
            }

            this._oDialog.setTitle("Add New Product");
            this._oDialog.open();
        },

        onEditProduct: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("productModel");
            var oData = Object.assign({}, oContext.getObject());
            var oView = this.getView();

            oView.getModel("createModel").setData(oData);

            if (!this._oDialog) {
                this.openFragment("productinventorymanagement.view.AddProduct");
                oView.addDependent(this._oDialog);
            }

            this._oDialog.setTitle("Edit Product");
            this._oDialog.open();
        },


        onSaveProduct: function () {
            var oDialog = this.byId("addProductDialog");
            var oData = this.getView().getModel("createModel").getData();

            if (!oData.productName || !oData.category || !oData.supplier ||
                isNaN(parseFloat(oData.price)) || parseFloat(oData.price) <= 0 ||
                isNaN(parseInt(oData.stockQuantity, 10)) || parseInt(oData.stockQuantity, 10) < 0 ||
                !oData.lastRestocked) {
                MessageBox.error("Please fill all required fields correctly.");
                return;
            }

            var oModel = this.getView().getModel("productModel");
            var aProducts = oModel.getProperty("/Products") || [];

            if (this._bEditMode) {
                Object.assign(this._oEditProduct.getObject(), oData);
                oModel.refresh(true);
                MessageBox.success("Product updated successfully!");
            } else {
                aProducts.unshift(oData);
                oModel.setProperty("/Products", aProducts);
                MessageBox.success("New product added successfully!");
            }

            oDialog.close();
        },

     
        onDeleteProduct: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("productModel");
            var oData = oContext.getObject();
            var oModel = this.getView().getModel("productModel");
            var aProducts = oModel.getProperty("/Products");

            if (oData.stockQuantity < 10) {
                MessageBox.warning(
                    "This product has low stock (" + oData.stockQuantity + "). Are you sure you want to delete it?",
                    {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        onClose: function (sAction) {
                            if (sAction === MessageBox.Action.OK) {
                                this._deleteProductByID(oData.ID, aProducts, oModel);
                            }
                        }.bind(this)
                    }
                );
            } else {
                this._deleteProductByID(oData.ID, aProducts, oModel);
            }
        },

        _deleteProductByID: function (sID, aProducts, oModel) {
            var iIndex = aProducts.findIndex(p => p.ID === sID);
            if (iIndex > -1) {
                aProducts.splice(iIndex, 1);
                oModel.setProperty("/Products", aProducts);
                MessageToast.show("Product deleted successfully!");
            }
        },

        onSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var aSelectedItems = oTable.getSelectedItems();
            var bMultiSelected = aSelectedItems.length > 0;

            this.getView().getModel("viewModel").setProperty("/isMultiSelectActive", bMultiSelected);
            this.byId("bulkDeleteBtn").setVisible(bMultiSelected);
            this.byId("UpdateBulkPriceBtn").setVisible(bMultiSelected);

        },

        onBulkDelete: function () {
            var oTable = this.byId("idProductsTable");
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) return;

            var oModel = this.getView().getModel("productModel");
            var aProducts = oModel.getProperty("/Products");
            var bHasLowStock = aSelectedItems.some(item => item.getBindingContext("productModel").getProperty("stockQuantity") < 10);

            var fnDelete = function () {
                aSelectedItems.forEach(item => {
                    var oContext = item.getBindingContext("productModel");
                    var iIndex = aProducts.findIndex(p => p.ID === oContext.getProperty("ID"));
                    if (iIndex > -1) aProducts.splice(iIndex, 1);
                });
                oModel.setProperty("/Products", aProducts);
                this.removeSelection();

                MessageToast.show("Selected products deleted!");
            }.bind(this);

            if (bHasLowStock) {
                MessageBox.warning(
                    "Some selected products have low stock (<10). Are you sure you want to delete them?",
                    {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        onClose: function (sAction) {
                            if (sAction === MessageBox.Action.OK) {
                                fnDelete();
                            }
                        }
                    }
                );
            } else {
                fnDelete();
            }
        },

        onBulkPriceBtn: function () {
            var oTable = this.byId("idProductsTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select products first.");
                return;
            }

            var aSelectedProducts = aSelectedItems.map(function (oItem) {
                var oData = Object.assign({}, oItem.getBindingContext("productModel").getObject());
                oData.individualPercent = 0;
                oData.newPrice = oData.price;
                return oData;
            });

            var oCreateModel = this.getView().getModel("createModel");
            oCreateModel.setProperty("/selectedProducts", aSelectedProducts);

            this.openFragment("productinventorymanagement.view.IncreasePrice");
        },


        onCancelInPrice: function () {
            this.removeSelection();
            this.closeFragment("productinventorymanagement.view.IncreasePrice");
        },

        onBulkPercentageChange: function (oEvent) {
            var percent = parseFloat(oEvent.getParameter("value")) || 0;
            var oCreateModel = this.getView().getModel("createModel");
            var aProducts = oCreateModel.getProperty("/selectedProducts");

            aProducts.forEach(function (p) {
                p.individualPercent = percent;
                p.newPrice = p.price + (p.price * percent / 100);
            });

            oCreateModel.setProperty("/bulkPercent", percent);
            oCreateModel.refresh(true);
        },

        onIndividualPercentageChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var oContext = oInput.getBindingContext("createModel");
            var oRowData = oContext.getObject();

            this.getView().getModel("createModel").setProperty("/bulkPercent", "");

            var percent = parseFloat(oRowData.individualPercent || 0);
            oRowData.newPrice = oRowData.price + (oRowData.price * percent / 100);

            oContext.getModel().refresh(true);
        },

        onSaveInPrice: function () {
            var oCreateModel = this.getView().getModel("createModel");
            var aSelectedProducts = oCreateModel.getProperty("/selectedProducts");

            if (!aSelectedProducts || aSelectedProducts.length === 0) {
                MessageToast.show("No products selected.");
                return;
            }
            var sConfirmText = "You are about to update prices:\n\n";
            aSelectedProducts.forEach(function (p) {
                sConfirmText += p.productName + " | " +
                    "Old: " + p.price + " ₹ | " +
                    "Change: " + p.individualPercent + "% | " +
                    "New: " + p.newPrice + " ₹\n";
            });
            MessageBox.confirm(sConfirmText, {
                title: "Confirm Price Update",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        var oProductModel = this.getView().getModel("productModel");
                        var aAllProducts = oProductModel.getProperty("/Products");

                        aSelectedProducts.forEach(function (updated) {
                            var oProd = aAllProducts.find(p => p.productID === updated.productID);
                            if (oProd) {
                                oProd.price = updated.newPrice;
                                oProd.individualPercent = updated.individualPercent;
                            }
                        });
                        oProductModel.refresh(true);
                        MessageToast.show("Prices updated successfully!");
                        this.onCancelInPrice();
                    }
                }.bind(this)
            });
            this.removeSelection();
        },

        ExportToExcel: function () {
            this.onExportToExcel();
        },

        onAddRestock: function () {
            var oTable = this.byId("idProductsTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select products first.");
                return;
            }

            var aSelectedProducts = aSelectedItems.map(function (oItem) {
                var oData = Object.assign({}, oItem.getBindingContext("productModel").getObject());
                oData.individualPercent = 0;
                oData.newStock = oData.stockQuantity;
                oData.newSupplier = oData.supplier;
                oData.newPrice = oData.price;
                oData.newlastRestocked = oData.lastRestocked;
                return oData;
            });

            var oCreateModel = this.getView().getModel("createModel");
            oCreateModel.setProperty("/selectedProducts", aSelectedProducts);

            this.openFragment("productinventorymanagement.view.AddRestock");
        },

        onCancelReStock: function () {
            this.closeFragment("productinventorymanagement.view.AddRestock");
            this.removeSelection();
        },

        onSaveRestock: function () {
            var oCreateModel = this.getView().getModel("createModel");
            var oProductModel = this.getView().getModel("productModel");
            var aSelectedProducts = oCreateModel.getProperty("/selectedProducts");
            var aAllProducts = oProductModel.getProperty("/Products");

            aSelectedProducts.forEach(function (oUpdated) {

                var oProduct = aAllProducts.find(p => p.productID === oUpdated.productID);
                if (oProduct) {

                    var iOldStock = parseInt(oProduct.stockQuantity || 0, 10);
                    var iAddedStock = parseInt(oUpdated.newStockQuantity || 0, 10);
                    oProduct.stockQuantity = iOldStock + (isNaN(iAddedStock) ? 0 : iAddedStock);

                    if (oUpdated.newlastRestocked) {
                        oProduct.lastRestocked = formatter.formatDate(new Date);
                    }

                        if (oUpdated.newPrice) {
                            oProduct.price = parseFloat(oUpdated.newPrice);
                        }

                        if (oUpdated.supplier) {
                            oProduct.supplier = oUpdated.supplier;
                        }
                    }
                });

            oProductModel.refresh(true);
            sap.m.MessageToast.show("Stock successfully updated for " + aSelectedProducts.length + " product(s).");
            this.onCancelReStock();
        },

    });
});