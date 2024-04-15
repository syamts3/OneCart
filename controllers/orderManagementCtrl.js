const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const getOrderManagement = async (req, res ) => {
    try {
        const orders = await Order.find(); 
        const userId = orders.address;                                             
        
        res.render('orderManagement',{ orders })
    } catch (error) {
        console.log(error.message);
    }
};


//<------------ load editOrderStatus -------------->
const getEditOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
     const order = await Order.findById(orderId);
        res.render('orderStatus' ,{ order });
    } catch (error) {
        console.log(error.message);
    }
};


const postEditOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const orders = await Order.findById(orderId);
        const productIds = orders.products.map(item => item);
        const products = await Product.find({ _id: { $in: productIds }});
        const carts = orders.carts.map(item => item);
        const stocks = products.map(x => x.stock);
        const quantity = carts.map(x => x.quantity);
        const updatedStatus = req.body.orderStatus;

        if(updatedStatus == 'Cancelled'){
            for (let i = 0; i < stocks.length; i++) {
                console.log('THE PRO: ',products[i].stock)
                products[i].stock += quantity[i]
                
                await products[i].save();
                
            }
        }
      
      

      const updatedFields = {
        status:updatedStatus
      };

      const order = await Order.findByIdAndUpdate( orderId, updatedFields, { new: true });
      if (!order) {
        return res.send('error');
   }
   return res.redirect('/admin/orderManagement');



    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    getOrderManagement,
    getEditOrderStatus,
    postEditOrderStatus
};