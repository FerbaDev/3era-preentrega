import { Server } from "socket.io";

const io = new Server(httpServer);
import ProductRepository from "../repositories/product.repository.js";
const productRepository = new ProductRepository(); 
import MessageModel from "../models/message.model.js";

class SocketManager {
    constructor(httpServer) {
        this.io = socket(httpServer);
        this.initSocketEvents();
    }

    async initSocketEvents() {
        this.io.on("connection", async (socket) => {
            console.log("Cliente conectado");
            
            socket.emit("products", await productRepository.getProducts() );

            socket.on("deleteProduct", async (id) => {
                await productRepository.deleteProduct(id);
                this.emitUpdatedProducts(socket);
            });

            socket.on("addProduct", async (producto) => {
                await productRepository.addProduct(producto);
                this.emitUpdatedProducts(socket);
            });

            socket.on("message", async (data) => {
                await MessageModel.create(data);
                const messages = await MessageModel.find();
                socket.emit("message", messages);
            });
        });
    }

    async emitUpdatedProducts(socket) {
        socket.emit("products", await productRepository.getProducts());
    }
}

export default SocketManager;