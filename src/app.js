import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import "./database.js";
import exphbs from "express-handlebars";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cors from "cors";
import path from 'path';

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import userRouter from "./routes/user.router.js";
import checkoutRouter from './routes/checkout.router.js';//ruta del checkout
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import swaggerJSDoc from 'swagger-jsdoc'; 
import swaggerUiExpress from 'swagger-ui-express';

const app = express();
const PUERTO = 8080; 

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Middleware de session
app.use(session({
    secret: "secretCoder",
    resave: false,  
    saveUninitialized: false,  
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://talba:talba@clustertalba.vnmlpsv.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ClusterTalba`, 
        ttl: 120
    })
}));

// Passport 
initializePassport();
app.use(passport.initialize());
app.use(passport.session()); 

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", userRouter);
app.use("/", viewsRouter);
app.use('/checkout', checkoutRouter);//ruta del checkout

const httpServer = app.listen(PUERTO, () => {
    console.log(`Conectado a http://localhost:${PUERTO}`);
});

// Websockets
import SocketManager from "./sockets/socketmanager.js";
new SocketManager(httpServer);


//3) Creamos un objeto de configuracion: swaggerOptions 

const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentacion sobre E-Commerce", 
            description: "App dedicada a la venta de articulos"
        }
    },
    apis: ["./src/docs/**/*.yaml"]
};

const specs = swaggerJSDoc(swaggerOptions); 

app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs))
