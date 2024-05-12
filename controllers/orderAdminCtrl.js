const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Wallet = require('../models/walletModel');
const Category = require('../models/categoryModel');

  /**
         * ! For admin order Management 
                                       **/

//<------------ order management -------------->
const getOrderManagement = async (req, res ) => {
            try {
                var page = 1;
                    const limit = 5;
                    if (req.query.page) {
                        page = parseInt(req.query.page);
                    }
                     
                    const orders = await Order.find()
                        .limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();
                  
                    const count = await Order.find().countDocuments();
                  
                    res.render('orderManagement',{
                        orders: orders,
                        totalPage: Math.ceil(count / limit),
                        currentPage: page,
                        previousPage: page > 1 ? page - 1 : 1,
                        nextPage: page < Math.ceil(count / limit) ? page + 1 : Math.ceil(count / limit)
                    });
                
            } catch (err) {
               res.render('error', { message : err.message });
      }   
};

//<------------ sort admin order -------------->

const sortOrderAdmin = async (req, res) => {
    try {
        const sortMethod = req.params.method;
        console.log('THE METHOD : ',sortMethod)
        var sortQuery = {}; 
   
        switch (sortMethod) {
           case "recentOrders":
               sortQuery = { createdate: -1 };
               break;
           case "recentOrders":
               sortQuery = { createdate: 1 };
               break;
           default:
               sortQuery = {};
       }

       if(sortMethod == "deleveredOrders"){
        var page = 1;
            const limit = 5;
            if (req.query.page) {
                page = parseInt(req.query.page);
            }
          
            const orders = await Order.find({status : "Delivered"})
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
          
            const count = await Order.find({status : "Delivered"}).countDocuments();
            
            res.render('orderManagement', {
                orders: orders,
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page > 1 ? page - 1 : 1,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : Math.ceil(count / limit)
            });
        
       }


            var page = 1;
            const limit = 5;
            if (req.query.page) {
                page = parseInt(req.query.page);
            }
          
            const orders = await Order.find()
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort(sortQuery) 
                .exec();
          
            const count = await Order.find().countDocuments();

            console.log('The order : ',orders)
          

            res.render('orderManagement', {
                orders: orders,
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page > 1 ? page - 1 : 1,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : Math.ceil(count / limit)
            });
        
    } catch (error) {
        console.log(error.message);
    }
}


//<------------ order details for admin -------------->
const orderDetailsAdmin = async (req, res) => {
    try {
        const orderId = req.params.id;
        const orders = await Order.findById( orderId );
        const address = orders.address;
        const userId = orders.userId;
        const user = await User.findById(userId);
        const products = orders.products.map(product => product._id);
        const product = await Product.find({ _id: { $in: products } });
        res.render('orderDetailsAdmin', {  address , product , orders , user })
    } catch (error) {
        console.log(error.message);
    }
};

//<------------ sales report -------------->
const getSalesReport = async (req, res) => {
    try {
        const currentDate = new Date();
        const day = currentDate.getDate();
            const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0, 0, 0);
            const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1, 23, 59, 59);
            
        
            const orders = await Order.find({ createdate: { $gte: startOfDay, $lte: endOfDay }}).lean();
            const productIds = [];
            orders.forEach(order => {
            order.products.forEach(product => {
                productIds.push(product._id);
            })});
    
          const products = await Product.find({ _id: {$in : productIds}})
          res.render('salesReport', {product : products})
      
    } catch (error) {
        console.log(error.message);
    }
};

//<------------ order status changing -------------->
const orderStatusChng = async (req, res) => {
    try {
    
        const {orderStatus , orderId } = req.body;
        const order = await Order.findById(orderId);

        if(order.status == "Processing"){
            if(orderStatus == "Shipped"){
                order.status = "Shipped";
                await order.save();
                res.redirect('/admin/orderManagement');
            }else{
                if(order.paymentMethod == "Razor Pay" || order.paymentMethod == "Wallet"){
                    const userId = order.userId;
                    const total = order.total;
                    const wallet = await Wallet.find({userId : userId});
                    console.log('Enter this',wallet)   
                    if(wallet == undefined){   
                       
                        wallet.amount =+ total;
                        const newWallet = new Wallet({
                            userId : userId,
                            amount : wallet.amount
                        });
                        await newWallet.save();
                        console.log('new wallet created')
                        }else{       
                        await Wallet.findOneAndUpdate(
                            { userId },
                            { $inc: { amount: total } },
                            { new: true }
                        );
                     console.log('amount added to the cart')
                 }}
                   const productIds = order.products.map(item => item);
                   const products = await Product.find({ _id: { $in: productIds }});
                   const stocks = products.map(x => x.stock);
                   order.status = orderStatus;
                   await order.save();
                   for (let i = 0; i < stocks.length; i++) {
                       products[i].stock += quantity[i]   
                       await products[i].save();
                   }
                   
                   res.redirect('/admin/orderManagement');
            }
        }else if(order.status == "Shipped"){
                 if(orderStatus == "Delivered"){
                    order.status = "Delivered";
                    await order.save();
                    res.redirect('/admin/orderManagement');
                   } else{
               
                 if(order.paymentMethod == "Razor Pay" || order.paymentMethod == "Wallet"){
                        const userId = order.userId;
                        const total = order.total;
                        const wallet = await Wallet.find({userId : userId});
                        console.log('Enter this',wallet)   
                        if(wallet == undefined){   
                       
                        wallet.amount =+ total;
                        const newWallet = new Wallet({
                            userId : userId,
                            amount : wallet.amount
                        });
                        await newWallet.save();
                        console.log('new wallet created')
                        }else{       
                        await Wallet.findOneAndUpdate(
                            { userId },
                            { $inc: { amount: total } },
                            { new: true }
                        );
                     console.log('amount added to the cart')
                 }}
                   const productIds = order.products.map(item => item);
                   const products = await Product.find({ _id: { $in: productIds }});
                   const stocks = products.map(x => x.stock);
                   order.status = orderStatus;
                   await order.save();
                   for (let i = 0; i < stocks.length; i++) {
                       products[i].stock += quantity[i]   
                       await products[i].save();
                   }
                   
                   res.redirect('/admin/orderManagement');
                }
        }else if(order.status == "returnAccepted"){

 
                     order.status = "Returned";
                     await order.save();
                     res.redirect('/admin/orderManagement');


                     if(order.paymentMethod == "Razor Pay" || order.paymentMethod == "Wallet"){
                        const userId = order.userId;
                        const total = order.total;
                        const wallet = await Wallet.find({userId : userId});
                        console.log('Enter this',wallet)   
                        if(wallet == undefined){   
                       
                        wallet.amount =+ total;
                        const newWallet = new Wallet({
                            userId : userId,
                            amount : wallet.amount
                        });
                        await newWallet.save();
                        console.log('new wallet created')
                        }else{       
                        await Wallet.findOneAndUpdate(
                            { userId },
                            { $inc: { amount: total } },
                            { new: true }
                        );
                     console.log('amount added to the cart')
                 }}
                   const productIds = order.products.map(item => item);
                   const products = await Product.find({ _id: { $in: productIds }});
                   const stocks = products.map(x => x.stock);
                   order.status = orderStatus;
                   await order.save();
                   for (let i = 0; i < stocks.length; i++) {
                       products[i].stock += quantity[i]   
                       await products[i].save();
                   }
                   
                   res.redirect('/admin/orderManagement');

            }
        
    } catch (error) {
        console.log(error.message);
    }
}


const sortSalesReport = async (req, res) => {
    try {
        console.log('The type : ',req.params)
        const type = req.params.type;
        if(type == "Delevered"){
            const order = await Order.find({ status: { $in: "Delivered" } });
            const userId = await order.map(x => x.userId);
            const user = await User.find({_id:{ $in : userId}})
            const email = await user.map(x => x.email);
            const name = await user.map(x => x.name);
            res.render('salesReport',{ order , email, name});
        }else if(type == "Cancelled"){
            const order = await Order.find({ status: { $in: "Cancelled" } });
            const userId = await order.map(x => x.userId);
            const user = await User.find({_id:{ $in : userId}})
            const email = await user.map(x => x.email);
            const name = await user.map(x => x.name);
            res.render('salesReport',{ order , email, name});
        }
       
    } catch (err) {
        console.log(err.message);
    }
};


//<------------ return accept by admin -------------->
 const returnAccept = async (req, res) => {
    try{
        console.log('REACHED HERE')
        const orderId = req.body.orderId;
        const order = await Order.findById(orderId);
        order.status = "returnAccepted";
        await order.save();
        res.redirect('/admin/orderManagement');
    }catch(err){
        res.render('error',{ message : err.message });
    }
 };


//<------------ return reject by admin -------------->
 const returnReject = async (req, res) => {
    try{
        const orderId = req.body.orderId;
        const order = await Order.findById(orderId);
        order.status = "returnRejected";
        await order.save();
        res.redirect('/admin/orderManagement');
    }catch(err){
        res.render('error',{ message : err.message });
    }
 };

 //<--------------------- daily order chart ----------------------->
 const orderDaily = async (req, res) => {
    try {
       const orders = await Order.find({}, 'createdate total').lean();
       res.json(orders);
     } catch (err) {
       console.error('Error fetching orders:', err);
       res.status(500).json({ error: 'Internal server error' });
     }
 }

  //<--------------------- monhtly order chart ----------------------->

 const orderMonthly = async (req, res) => {
    try {
       const orders = await Order.find({}, 'createdate total').lean();
       res.json(orders);
     } catch (err) {
       console.error('Error fetching orders:', err);
       res.status(500).json({ error: 'Internal server error' });
     }
 }

  //<--------------------- yearly order chart ----------------------->

 const orderYearly = async (req, res) => {
    try {
       const orders = await Order.find({}, 'createdate total').lean();
       res.json(orders);
     } catch (err) {
       console.error('Error fetching orders:', err);
       res.status(500).json({ error: 'Internal server error' });
     }
 }


  //<--------------------- sales report ----------------------->
  const salesReport = async (req, res ) => {
    try{
        const format = req.params.format;
        const currentDate = new Date();
        if(format == "daily"){
            const day = currentDate.getDate();
            const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0, 0, 0);
            const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1, 23, 59, 59);
            
            const orders = await Order.find({ createdate: { $gte: startOfDay, $lte: endOfDay }}).lean();


            const productIds = [];
            const quantity = [];
            const date = [];
            orders.forEach(order => {
            order.carts.forEach(cart => {
                productIds.push(cart.productId,);
                quantity.push(cart.quantity);
                date.push(order.createdate);
            })});

       
    
          const products = await Product.find({ _id: {$in : productIds}});

          console.log("The pro : ",productIds)
       
            

          res.render('salesReport', {product : [products, quantity ,date]})



        }else if(format == "monthly"){
            
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

            const orders = await Order.find({
                createdate: { $gte: startOfMonth, $lte: endOfMonth }
            }).lean();

            const productIds = [];
            orders.forEach(order => {
                order.products.forEach(product => {
                    productIds.push(product._id);
                });
           }); 
           const products = await Product.find({ _id: {$in : productIds}})

           console.log('The date : ',products)
            res.render('salesReport', {product: products})
        }else if(format == "yearly"){

            const startOfYear = new Date(currentDate.getFullYear(), 0, 1, 0, 0, 0); 
            const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59);
            

            const orders = await Order.find({
                createdate: { $gte: startOfYear, $lte: endOfYear }
            }).lean();

            const productIds = [];
            orders.forEach(order => {
                order.products.forEach(product => {
                    productIds.push(product._id);
                });
           }); 
           const products = await Product.find({ _id: {$in : productIds}})

           console.log('The date : ',products)
            res.render('salesReport', {product: products})
        }

    }catch(err){
        res.render('error',{ message: err.message });
    }
  };


module.exports = {
    getOrderManagement,
    sortOrderAdmin,
    orderDetailsAdmin,
    getSalesReport,
    orderStatusChng,
    sortSalesReport,
    returnAccept,
    returnReject,
    orderDaily,
    orderMonthly,
    orderYearly,
    salesReport
};