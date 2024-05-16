import express from "express";
const router = express.Router();
import ViewsController from "../controllers/view.controller.js";
const viewsController = new ViewsController();
import checkUserRole from "../middleware/checkrole.js";
import passport from "passport";

router.get("/products", checkUserRole(['usuario']),passport.authenticate('login', { session: false }), viewsController.renderProducts);

router.get("/carts/:cid", viewsController.renderCart);
router.get("/login", viewsController.renderLogin);
router.get("/register", viewsController.renderRegister);
router.get("/realtimeproducts", checkUserRole(['admin']), viewsController.renderRealTimeProducts);
router.get("/chat", checkUserRole(['usuario']) ,viewsController.renderChat);
router.get("/", viewsController.renderHome);

module.exports = router;