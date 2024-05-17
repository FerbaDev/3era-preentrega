import express from "express";
const router = express.Router();
import passport from "passport";
import UserController from "../controllers/user.controller.js";

const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", passport.authenticate("login", { session: false }), userController.profile);
router.post("/logout", userController.logout.bind(userController));
router.get("/admin", passport.authenticate("login", { session: false }), userController.admin);

export default router;