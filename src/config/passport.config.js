// passport.config.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import UserModel from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import CartController from "../controllers/cart.controller.js";
const cartController = new CartController();

const initializePassport = () => {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email",
    }, async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body;

        try {
            let user = await UserModel.findOne({ email });
            if (user) return done(null, false, { message: 'El usuario ya existe' });
            
            let newCart = await cartController.createCart();
            let newUser = { 
                first_name, last_name, email, age, password: createHash(password), cart: newCart, username: first_name + " " + last_name 
            };
            let result = await UserModel.create(newUser);
            return done(null, result);
        } catch (error) {
            return done(error);
        }
    }));
    
    passport.use("login", new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            let user = await UserModel.findOne({ email });
            if (!user) {
                console.log("Usuario no existe");
                return done(null, false);
            }
            if (!isValidPassword(password, user)) return done(null, false);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await UserModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
}

export default initializePassport;
