import express from "express";
import { fulfillmentAuthenticateJWT } from "../../middlewares/fulfillmentAuthenticationMiddleware";
import { addTrackingUpdate, all_order, getOrderTrackingHistory, single_order } from "../../controllers/fulfillmentController/order.controller";
import { deleteProduct, getAllProduct, getSingleProduct, createProduct, updateProduct } from "../../controllers/fulfillmentController/product.controller";
import { upload } from "../../middlewares/multerMiddleware";
import { createCategory, deleteCategory, getAllCategory, getSingleCategory, updateCategory } from "../../controllers/fulfillmentController/category.controller";
import { createInventory, deleteInventory, getAllInventory, getSingleInventory, updateInventory } from "../../controllers/adminController/inventory.controller";
import { createWarehouse, deleteWarehouse, getAllWarehouse, getSingleWarehouse, updateWarehouse } from "../../controllers/fulfillmentController/warehouse.controller";
import { createUser, deleteUser, downloadUserTemplate, getAllUser, getSingleUser, updateUser, uploadUsersFromCSV } from "../../controllers/fulfillmentController/user.controller";
import { uploadCSV } from "../../middlewares/uploadCSVMiddleware";
import { approve_deny_compliance, get_all_compliance, get_compliance } from "../../controllers/fulfillmentController/compliance.comtroller";

export const fulfillmentRouter = express.Router();

fulfillmentRouter.use(fulfillmentAuthenticateJWT);

//Product Route Start
fulfillmentRouter.get('/products', getAllProduct);
fulfillmentRouter.get('/product', getSingleProduct);
fulfillmentRouter.post('/create-product', upload.fields([ { name: "product_image", maxCount: 1 },{ name: "images", maxCount: 10 }, ]),createProduct);
fulfillmentRouter.put('/update-product', upload.fields([ { name: "product_image", maxCount: 1 },{ name: "images", maxCount: 10 }, ]),updateProduct);
fulfillmentRouter.delete('/delete-product',deleteProduct);
//Product Route End

//Category Route Start
fulfillmentRouter.get('/categories', getAllCategory);
fulfillmentRouter.get('/category', getSingleCategory);
fulfillmentRouter.post('/create-category', createCategory);
fulfillmentRouter.put('/update-category', updateCategory);
fulfillmentRouter.delete('/delete-category',deleteCategory);
//Category Route End

//Inventory Route Start
fulfillmentRouter.get('/inventories', getAllInventory);
fulfillmentRouter.get('/inventory', getSingleInventory);
fulfillmentRouter.post('/create-inventory',createInventory);
fulfillmentRouter.put('/update-inventory',updateInventory);
fulfillmentRouter.delete('/delete-inventory',deleteInventory);
//Inventory Route End

//Warehouse Route Start
fulfillmentRouter.get('/warehouses', getAllWarehouse);
fulfillmentRouter.get('/warehouse', getSingleWarehouse);
fulfillmentRouter.post('/create-warehouse', createWarehouse);
fulfillmentRouter.put('/update-warehouse', updateWarehouse);
fulfillmentRouter.delete('/delete-warehouse',deleteWarehouse);
//Warehouse Route End

//User Route Start
fulfillmentRouter.get('/users', getAllUser);
fulfillmentRouter.get('/user', getSingleUser);
fulfillmentRouter.post('/create-user', createUser);
fulfillmentRouter.post('/upload-users', uploadCSV, uploadUsersFromCSV)
fulfillmentRouter.put('/update-user', updateUser);
fulfillmentRouter.delete('/delete-user',deleteUser);
fulfillmentRouter.get('/users-template', downloadUserTemplate)
//User Route End

// Order Route Starts
fulfillmentRouter.get('/all-order', all_order)
fulfillmentRouter.get('/single-order', single_order)
// Tracking routes
fulfillmentRouter.post('/:orderId/tracking', addTrackingUpdate);
fulfillmentRouter.get('/:orderId/tracking',  getOrderTrackingHistory);

// Compliance Route Start
fulfillmentRouter.get('/all-compliance', get_all_compliance)
fulfillmentRouter.put('/approve-deny-compliance', approve_deny_compliance)
fulfillmentRouter.get('/get-compliance', get_compliance)
// Compliance Route Ends