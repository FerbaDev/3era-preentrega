import TicketModel from '../models/ticket.model.js';
import UserModel from '../models/user.model.js';

class CheckoutController {
    async viewCheckout(req, res) {
        const ticketId = req.params.ticketId;

        try {
            const ticket = await TicketModel.findById(ticketId).populate('purchaser');
            if (!ticket) {
                return res.status(404).send('Ticket no encontrado');
            }

            const purchaser = await UserModel.findById(ticket.purchaser);
            if (!purchaser) {
                return res.status(404).send('Usuario no encontrado');
            }

            res.render('checkout', {
                cliente: purchaser.name,  // Asegúrate de que el nombre del campo coincida con tu modelo de usuario
                numTicket: ticket.code,
                email: purchaser.email,
            });
        } catch (error) {
            console.error('Error al obtener el ticket:', error);
            res.status(500).send('Error interno del servidor');
        }
    }
}

export default new CheckoutController();

