"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fulfillmentRouter = void 0;
const express_1 = __importDefault(require("express"));
const fulfillmentAuthenticationMiddleware_1 = require("../../middlewares/fulfillmentAuthenticationMiddleware");
const order_controller_1 = require("../../controllers/fulfillmentController/order.controller");
const product_controller_1 = require("../../controllers/fulfillmentController/product.controller");
const multerMiddleware_1 = require("../../middlewares/multerMiddleware");
const category_controller_1 = require("../../controllers/fulfillmentController/category.controller");
const inventory_controller_1 = require("../../controllers/adminController/inventory.controller");
const warehouse_controller_1 = require("../../controllers/fulfillmentController/warehouse.controller");
const user_controller_1 = require("../../controllers/fulfillmentController/user.controller");
const uploadCSVMiddleware_1 = require("../../middlewares/uploadCSVMiddleware");
const compliance_comtroller_1 = require("../../controllers/fulfillmentController/compliance.comtroller");
exports.fulfillmentRouter = express_1.default.Router();
exports.fulfillmentRouter.use(fulfillmentAuthenticationMiddleware_1.fulfillmentAuthenticateJWT);
//Product Route Start
exports.fulfillmentRouter.get('/products', product_controller_1.getAllProduct);
exports.fulfillmentRouter.get('/product', product_controller_1.getSingleProduct);
exports.fulfillmentRouter.post('/create-product', multerMiddleware_1.upload.fields([{ name: "product_image", maxCount: 1 }, { name: "images", maxCount: 10 },]), product_controller_1.createProduct);
exports.fulfillmentRouter.put('/update-product', multerMiddleware_1.upload.fields([{ name: "product_image", maxCount: 1 }, { name: "images", maxCount: 10 },]), product_controller_1.updateProduct);
exports.fulfillmentRouter.delete('/delete-product', product_controller_1.deleteProduct);
//Product Route End
//Category Route Start
exports.fulfillmentRouter.get('/categories', category_controller_1.getAllCategory);
exports.fulfillmentRouter.get('/category', category_controller_1.getSingleCategory);
exports.fulfillmentRouter.post('/create-category', category_controller_1.createCategory);
exports.fulfillmentRouter.put('/update-category', category_controller_1.updateCategory);
exports.fulfillmentRouter.delete('/delete-category', category_controller_1.deleteCategory);
//Category Route End
//Inventory Route Start
exports.fulfillmentRouter.get('/inventories', inventory_controller_1.getAllInventory);
exports.fulfillmentRouter.get('/inventory', inventory_controller_1.getSingleInventory);
exports.fulfillmentRouter.post('/create-inventory', inventory_controller_1.createInventory);
exports.fulfillmentRouter.put('/update-inventory', inventory_controller_1.updateInventory);
exports.fulfillmentRouter.delete('/delete-inventory', inventory_controller_1.deleteInventory);
//Inventory Route End
//Warehouse Route Start
exports.fulfillmentRouter.get('/warehouses', warehouse_controller_1.getAllWarehouse);
exports.fulfillmentRouter.get('/warehouse', warehouse_controller_1.getSingleWarehouse);
exports.fulfillmentRouter.post('/create-warehouse', warehouse_controller_1.createWarehouse);
exports.fulfillmentRouter.put('/update-warehouse', warehouse_controller_1.updateWarehouse);
exports.fulfillmentRouter.delete('/delete-warehouse', warehouse_controller_1.deleteWarehouse);
//Warehouse Route End
//User Route Start
exports.fulfillmentRouter.get('/users', user_controller_1.getAllUser);
exports.fulfillmentRouter.get('/user', user_controller_1.getSingleUser);
exports.fulfillmentRouter.post('/create-user', user_controller_1.createUser);
exports.fulfillmentRouter.post('/upload-users', uploadCSVMiddleware_1.uploadCSV, user_controller_1.uploadUsersFromCSV);
exports.fulfillmentRouter.put('/update-user', user_controller_1.updateUser);
exports.fulfillmentRouter.delete('/delete-user', user_controller_1.deleteUser);
exports.fulfillmentRouter.get('/users-template', user_controller_1.downloadUserTemplate);
//User Route End
// Order Route Starts
exports.fulfillmentRouter.get('/all-order', order_controller_1.all_order);
exports.fulfillmentRouter.get('/single-order', order_controller_1.single_order);
// Tracking routes
exports.fulfillmentRouter.post('/:orderId/tracking', order_controller_1.addTrackingUpdate);
exports.fulfillmentRouter.get('/:orderId/tracking', order_controller_1.getOrderTrackingHistory);
// Compliance Route Start
exports.fulfillmentRouter.get('/all-compliance', compliance_comtroller_1.get_all_compliance);
exports.fulfillmentRouter.put('/approve-deny-compliance', compliance_comtroller_1.approve_deny_compliance);
exports.fulfillmentRouter.get('/get-compliance', compliance_comtroller_1.get_compliance);
// Compliance Route Ends
