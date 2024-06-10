import TicketModel from "../models/ticket.model.js";
import UserModel from "../models/user.model.js";
import CartRepository from "../repositories/cart.repository.js";
const cartRepository = new CartRepository();
import ProductRepository from "../repositories/product.repository.js";
const productRepository = new ProductRepository();
import { generateUniqueCode, calcularTotal } from "../utils/cartutils.js";




class CartController {
    async createCart() {
        try {
            const newCart = await cartRepository.createCart();
            return newCart;
        } catch (error) {
            console.error("Error al crear carrito en cart controller", error);
            throw error;
        }
    }

    async getProductsFromCart(req, res) {
        const cartId = req.params.cid;
        try {
            const products = await cartRepository.getProductsFromCart(cartId);
            if (!products) {
                return res.status(404).json({ error: "Carrito no encontrado" });
            }
            res.json(products);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async addProductToCart(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;
        try {
            await cartRepository.addProduct(cartId, productId, quantity);
            const cartID = (req.user.cart).toString();

            res.redirect(`/carts/${cartID}`)
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async deleteProductFromCart(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        try {
            const updatedCart = await cartRepository.deleteProduct(cartId, productId);
            res.json({
                status: 'success',
                message: 'Producto eliminado del carrito correctamente',
                updatedCart,
            });
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async updateProductsInCart(req, res) {
        const cartId = req.params.cid;
        const updatedProducts = req.body;
        // Debes enviar un arreglo de productos en el cuerpo de la solicitud
        try {
            const updatedCart = await cartRepository.updateProductsInCart(cartId, updatedProducts);
            res.json(updatedCart);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async updateQuantity(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;
        try {
            const updatedCart = await cartRepository.updateQuantityInCart(cartId, productId, newQuantity);

            res.json({
                status: 'success',
                message: 'Cantidad del producto actualizada correctamente',
                updatedCart,
            });

        } catch (error) {
            res.status(500).send("Error al actualizar la cantidad de productos");
        }
    }

    async emptyCart(req, res) {
        const cartId = req.params.cid;
        try {
            const updatedCart = await cartRepository.emptyCart(cartId);

            res.json({
                status: 'success',
                message: 'Todos los productos del carrito fueron eliminados correctamente',
                updatedCart,
            });

        } catch (error) {
            res.status(500).send("Error");
        }
    }

    //checkout: 
    async finalizarCompra(req, res) {
        const cartId = req.params.cid;
        try {
            console.log(`Iniciando proceso de compra para el carrito: ${cartId}`);
    
            // Obtener el carrito y sus productos
            const cart = await cartRepository.getProductsFromCart(cartId);
            if (!cart) {
                console.error('Carrito no encontrado');
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }
    
            const products = cart.products;
            console.log(`Productos en el carrito: ${JSON.stringify(products)}`);
    
            // Inicializar un arreglo para almacenar los productos no disponibles
            const productosNoDisponibles = [];
    
            // Verificar el stock y actualizar los productos disponibles
            for (const item of products) {
                const productId = item.product._id || item.product;
                console.log(`Verificando producto: ${productId}`);
    
                const product = await productRepository.getProductById(productId);
                console.log(`Producto obtenido de la base de datos: ${JSON.stringify(product)}`);
    
                if (!product) {
                    console.error(`Producto no encontrado: ${productId}`);
                    productosNoDisponibles.push(productId);
                    continue;
                }
    
                if (product.status === undefined || product.category === undefined) {
                    console.error(`Producto con campos faltantes: ${productId}`);
                    productosNoDisponibles.push(productId);
                    continue;
                }
    
                if (product.stock >= item.quantity) {
                    // Si hay suficiente stock, restar la cantidad del producto
                    product.stock -= item.quantity;
                    await product.save();
                } else {
                    // Si no hay suficiente stock, agregar el ID del producto al arreglo de no disponibles
                    productosNoDisponibles.push(productId);
                }
            }
    
            const userWithCart = await UserModel.findOne({ cart: cartId });
            if (!userWithCart) {
                console.error('Usuario con carrito no encontrado');
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
    
            // Crear un ticket con los datos de la compra
            const ticket = new TicketModel({
                code: generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: calcularTotal(cart.products.filter(item => !productosNoDisponibles.includes(item.product._id || item.product))),
                purchaser: userWithCart._id
            });
            await ticket.save();
    
            // Eliminar del carrito los productos que sí se compraron
            cart.products = cart.products.filter(item => productosNoDisponibles.includes(item.product._id || item.product));
    
            // Guardar el carrito actualizado en la base de datos
            await cart.save();
    
            res.status(200).json({ productosNoDisponibles });
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    

}

export default CartController;
