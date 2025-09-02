import express from "express";
import { adminOnly } from "../../middlewares/adminMiddleware";
import { authenticateJWT } from "../../middlewares/authenticationMiddleware";
import { createProduct, deleteProduct, getAllProduct, getSingleProduct, updateProduct } from "../../controllers/adminController/product.controller";
import { upload } from "../../middlewares/multerMiddleware";
import { createProductVariant, deleteProductVariant, getAllProductVariant, getSingleProductVariant, updateProductVariant } from "../../controllers/adminController/product.variant.controller";
import { createCategory, deleteCategory, getAllCategory, getSingleCategory, updateCategory } from "../../controllers/adminController/category.controller";
import { createInventory, deleteInventory, getAllInventory, getSingleInventory, updateInventory } from "../../controllers/adminController/inventory.controller";
import { createWarehouse, deleteWarehouse, getAllWarehouse, getSingleWarehouse, updateWarehouse } from "../../controllers/adminController/warehouse.controller";
import { createUser, deleteUser, downloadUserTemplate, getAllUser, getSingleUser, updateUser, uploadUsersFromCSV } from "../../controllers/adminController/user.controller";
import { uploadCSV } from "../../middlewares/uploadCSVMiddleware";
import { addNote, addTrackingUpdate, all_order, deleteNote, getNotes, getOrderTrackingHistory, single_order } from "../../controllers/adminController/order.controller";
import { exportUsersWithLoansAsCsv } from "../../controllers/adminController/repayment.list.controller";
import { approve_deny_compliance, get_all_compliance, get_compliance } from "../../controllers/adminController/compliance.comtroller";

export const adminRouter = express.Router();

adminRouter.use(authenticateJWT, adminOnly);

//Product Route Start
adminRouter.get('/products', getAllProduct);
adminRouter.get('/product', getSingleProduct);
adminRouter.post('/create-product', upload.fields([ { name: "product_image", maxCount: 1 },{ name: "images", maxCount: 10 }, ]),createProduct);
adminRouter.put('/update-product', upload.fields([ { name: "product_image", maxCount: 1 },{ name: "images", maxCount: 10 }, ]),updateProduct);
adminRouter.delete('/delete-product',deleteProduct);
//Product Route End

//Product Variant Route Start
adminRouter.get('/product-variants', getAllProductVariant);
adminRouter.get('/product-variant', getSingleProductVariant);
adminRouter.post('/create-product-variant', upload.fields([ { name: "image", maxCount: 1 } ]),createProductVariant);
adminRouter.put('/update-product-variant', upload.fields([ { name: "image", maxCount: 1 } ]),updateProductVariant);
adminRouter.delete('/delete-product-variant',deleteProductVariant);
//Product variant Route End

//Category Route Start
adminRouter.get('/categories', getAllCategory);
adminRouter.get('/category', getSingleCategory);
adminRouter.post('/create-category', createCategory);
adminRouter.put('/update-category', updateCategory);
adminRouter.delete('/delete-category',deleteCategory);
//Category Route End

//Inventory Route Start
adminRouter.get('/inventories', getAllInventory);
adminRouter.get('/inventory', getSingleInventory);
adminRouter.post('/create-inventory',createInventory);
adminRouter.put('/update-inventory',updateInventory);
adminRouter.delete('/delete-inventory',deleteInventory);
//Inventory Route End

//Warehouse Route Start
adminRouter.get('/warehouses', getAllWarehouse);
adminRouter.get('/warehouse', getSingleWarehouse);
adminRouter.post('/create-warehouse', createWarehouse);
adminRouter.put('/update-warehouse', updateWarehouse);
adminRouter.delete('/delete-warehouse',deleteWarehouse);
//Warehouse Route End

//User Route Start
adminRouter.get('/users', getAllUser);
adminRouter.get('/user', getSingleUser);
adminRouter.post('/create-user', createUser);
adminRouter.post('/upload-users', uploadCSV, uploadUsersFromCSV)
adminRouter.put('/update-user', updateUser);
adminRouter.delete('/delete-user',deleteUser);
adminRouter.get('/users-template', downloadUserTemplate)
//User Route End

// Order Route Starts
adminRouter.get('/all-order', all_order)
adminRouter.get('/single-order', single_order)
// Tracking routes
adminRouter.post('/:orderId/tracking', addTrackingUpdate);
adminRouter.get('/:orderId/tracking',  getOrderTrackingHistory);

// Note routes
adminRouter.post('/:orderId/notes',  addNote);
adminRouter.get('/:orderId/notes',  getNotes);
adminRouter.delete('/notes/:noteId',  deleteNote);
// Order Route Ends

// Download Users with Loan Starts
adminRouter.get('/export-loans', exportUsersWithLoansAsCsv)
// Download Users with Loan Ends

// Compliance Route Start
adminRouter.get('/all-compliance', get_all_compliance)
adminRouter.put('/approve-deny-compliance', approve_deny_compliance)
adminRouter.get('/get-compliance', get_compliance)
// Compliance Route Ends