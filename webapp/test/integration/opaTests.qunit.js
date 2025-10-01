/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["productinventorymanagement/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
