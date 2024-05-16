import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
//traemos el modelo y las funciones de bcrypt
import UserModel from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import CartManager from "../controllers/cartManager.js";
const cartManager = new CartManager();


const initializePassport = () => {
    //estrategia de registro 
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email",

    }, async (req, username, password, done) => {
        const {first_name, last_name, email, age} = req.body;

        let newCart = await cartManager.createCart();
        try {
            //verificamos si el mail existe
            let user = await UserModel.findOne({email});
            if (user) return done(null, false)
            
            let newUser= { 
                first_name, last_name, email, age, password: createHash(password), cart: newCart
            }
            let result = await UserModel.create(newUser);
            return done(null, result)
        } catch (error) {
            return done(error)
        }
    }))
    
    passport.use("login", new LocalStrategy({ usernameField: "email"}, async (email, password, done) => {
        try {
            let user = await UserModel.findOne({email});
            if (!user) {
                console.log("Usuario no existe");
                return done(null, false)
            }
            if (!isValidPassword(password, user)) return done(null, false);
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }))

    //serializar usuarios
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })
    passport.deserializeUser(async (id, done) => {
        let user = await UserModel.findById({_id: id});
        done(null, user);
    })

    
}

export default initializePassport; 