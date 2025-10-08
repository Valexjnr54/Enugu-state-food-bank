"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../../controllers/adminController/product.controller");
const multerMiddleware_1 = require("../../middlewares/multerMiddleware");
const product_variant_controller_1 = require("../../controllers/adminController/product.variant.controller");
const category_controller_1 = require("../../controllers/adminController/category.controller");
const inventory_controller_1 = require("../../controllers/adminController/inventory.controller");
const warehouse_controller_1 = require("../../controllers/adminController/warehouse.controller");
const user_controller_1 = require("../../controllers/adminController/user.controller");
const uploadCSVMiddleware_1 = require("../../middlewares/uploadCSVMiddleware");
const order_controller_1 = require("../../controllers/adminController/order.controller");
const repayment_list_controller_1 = require("../../controllers/adminController/repayment.list.controller");
const compliance_controller_1 = require("../../controllers/adminController/compliance.controller");
const fulfillment_officer_controller_1 = require("../../controllers/adminController/fulfillment.officer.controller");
const cashier_controller_1 = require("../../controllers/adminController/cashier.controller");
exports.adminRouter = express_1.default.Router();
// adminRouter.use(authenticateJWT, adminOnly);
//Product Route Start
exports.adminRouter.get('/products', product_controller_1.getAllProduct);
exports.adminRouter.get('/product', product_controller_1.getSingleProduct);
exports.adminRouter.post('/create-product', multerMiddleware_1.upload.fields([{ name: "product_image", maxCount: 1 }, { name: "images", maxCount: 10 },]), product_controller_1.createProduct);
exports.adminRouter.put('/update-product', multerMiddleware_1.upload.fields([{ name: "product_image", maxCount: 1 }, { name: "images", maxCount: 10 },]), product_controller_1.updateProduct);
exports.adminRouter.delete('/delete-product', product_controller_1.deleteProduct);
//Product Route End
//Product Variant Route Start
exports.adminRouter.get('/product-variants', product_variant_controller_1.getAllProductVariant);
exports.adminRouter.get('/product-variant', product_variant_controller_1.getSingleProductVariant);
exports.adminRouter.post('/create-product-variant', multerMiddleware_1.upload.fields([{ name: "image", maxCount: 1 }]), product_variant_controller_1.createProductVariant);
exports.adminRouter.put('/update-product-variant', multerMiddleware_1.upload.fields([{ name: "image", maxCount: 1 }]), product_variant_controller_1.updateProductVariant);
exports.adminRouter.delete('/delete-product-variant', product_variant_controller_1.deleteProductVariant);
//Product variant Route End
//Category Route Start
exports.adminRouter.get('/categories', category_controller_1.getAllCategory);
exports.adminRouter.get('/category', category_controller_1.getSingleCategory);
exports.adminRouter.post('/create-category', category_controller_1.createCategory);
exports.adminRouter.put('/update-category', category_controller_1.updateCategory);
exports.adminRouter.delete('/delete-category', category_controller_1.deleteCategory);
//Category Route End
//Inventory Route Start
exports.adminRouter.get('/inventories', inventory_controller_1.getAllInventory);
exports.adminRouter.get('/inventory', inventory_controller_1.getSingleInventory);
exports.adminRouter.post('/create-inventory', inventory_controller_1.createInventory);
exports.adminRouter.put('/update-inventory', inventory_controller_1.updateInventory);
exports.adminRouter.delete('/delete-inventory', inventory_controller_1.deleteInventory);
//Inventory Route End
//Warehouse Route Start
exports.adminRouter.get('/warehouses', warehouse_controller_1.getAllWarehouse);
exports.adminRouter.get('/warehouse', warehouse_controller_1.getSingleWarehouse);
exports.adminRouter.post('/create-warehouse', warehouse_controller_1.createWarehouse);
exports.adminRouter.put('/update-warehouse', warehouse_controller_1.updateWarehouse);
exports.adminRouter.delete('/delete-warehouse', warehouse_controller_1.deleteWarehouse);
//Warehouse Route End
//User Route Start
exports.adminRouter.get('/users', user_controller_1.getAllUser);
exports.adminRouter.get('/user', user_controller_1.getSingleUser);
exports.adminRouter.post('/create-user', user_controller_1.createUser);
exports.adminRouter.post('/upload-users', uploadCSVMiddleware_1.uploadCSV, user_controller_1.uploadUsersFromCSV);
exports.adminRouter.put('/update-user', user_controller_1.updateUser);
exports.adminRouter.delete('/delete-user', user_controller_1.deleteUser);
exports.adminRouter.get('/users-template', user_controller_1.downloadUserTemplate);
//User Route End
// Order Route Starts
exports.adminRouter.get('/all-order', order_controller_1.all_order);
exports.adminRouter.get('/single-order', order_controller_1.single_order);
// Tracking routes
exports.adminRouter.post('/:orderId/tracking', order_controller_1.addTrackingUpdate);
exports.adminRouter.get('/:orderId/tracking', order_controller_1.getOrderTrackingHistory);
// Note routes
exports.adminRouter.post('/:orderId/notes', order_controller_1.addNote);
exports.adminRouter.get('/:orderId/notes', order_controller_1.getNotes);
exports.adminRouter.delete('/notes/:noteId', order_controller_1.deleteNote);
// Order Route Ends
// Download Users with Loan Starts
exports.adminRouter.get('/export-loans', repayment_list_controller_1.exportUsersWithLoansAsCsv);
// Download Users with Loan Ends
// Compliance Route Start
exports.adminRouter.get('/all-compliance', compliance_controller_1.get_all_compliance);
exports.adminRouter.put('/approve-deny-compliance', compliance_controller_1.approve_deny_compliance);
exports.adminRouter.get('/get-compliance', compliance_controller_1.get_compliance);
// Compliance Route Ends
//Fulfillment Route Start
exports.adminRouter.get('/fulfillment-officers', fulfillment_officer_controller_1.getAllOfficer);
exports.adminRouter.get('/fulfillment-officer', fulfillment_officer_controller_1.getSingleOfficer);
exports.adminRouter.post('/create-fulfillment-officer', fulfillment_officer_controller_1.createOfficer);
exports.adminRouter.put('/update-fulfillment-officer', fulfillment_officer_controller_1.updateOfficer);
exports.adminRouter.delete('/delete-fulfillment-officer', fulfillment_officer_controller_1.deleteOfficer);
//Fulfillment Route End
//Fulfillment Route Start
exports.adminRouter.get('/cashiers', cashier_controller_1.getAllCashier);
exports.adminRouter.get('/cashier', cashier_controller_1.getSingleCashier);
exports.adminRouter.post('/create-cashier', cashier_controller_1.createCashier);
exports.adminRouter.put('/update-cashier', cashier_controller_1.updateCashier);
exports.adminRouter.delete('/delete-cashier', cashier_controller_1.deleteCashier);
//Fulfillment Route End
