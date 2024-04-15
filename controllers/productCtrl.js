const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const multer = require('multer');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//<------------ imgage rendering -------------->
const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null,'./public/product_images')
    },
    filename:(req, file, cb) => {
        const name = Date.now()+''+file.originalname;
        cb(null, name);
    }
});
const upload = multer({ storage }).array('productImage');

//<------------ admin product listing -------------->
const getProduct = async(req, res) => {
    try {
       const products = await Product.find();
       res.render('product-list',{products})
    } catch (error) {
       console.log(error);
       res.status(500).send('Server internal Error');
    }   
   };

   //<------------ admin proudct add page load -------------->
const loadProduct = async(req, res) => {
    const categories = await Category.find({deleted: false})
    try {
        res.render('product-add',{categories})
    } catch (error) {
        res.send(error.message);
    }
};


//<------------ admin post add prouduct -------------->
const insertProduct = async (req, res) => {
    try {
        const { price, size, stock, } = req.body;
          
            const productName = req.body.productName;
          if(price < 0){
            console.log('The price should be positive');
            res.redirect('/admin/product-add');
             
            }else if(size < 0){
                console.log(`SIZE IS CAN'T BE NEGATIVE`);
                res.redirect('/admin/product-add');
            }else if(stock < 0){
                console.log(`STOCK IS CAN'T BE NEGATIVE`);
                res.redirect('/admin/product-add');
            }else{
                const existingProduct = await Product.find({ productName: productName });
                if (existingProduct.length == 0) {
                        const productImages = req.files.map(file => file.filename);
                        const product = new Product({
                            productName: req.body.productName,
                            productImage: productImages,
                            category: req.body.category,
                            description: req.body.description,
                            brand: req.body.brand,
                            color: req.body.color,
                            price: req.body.price,
                            size: req.body.size,
                            stock: req.body.stock
                        });
        
                        await product.save();
                        res.redirect('/admin/product-list');
                  
            }
        
             else {
                console.log('Product already exists');
                res.redirect('/admin/product-list');
            }
          }

          

      
        }
       

        // Add flash messages if needed
    catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};



//<------------ admin  delete product  -------------->
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        console.log('THE PROD: ',id);
     if(product.deleted == false){

        product.deleted = true;
        await product.save();
        return res.redirect('/admin/product-list');
     }
     else if(product.deleted == true) {
        product.deleted = false;
        await product.save();
        return res.redirect('/admin/product-list');
     }else{
        return res.status(404).send('prouduct not found');
     }


    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
};

//<------------ admin load product edit -------------->
const loadProductEdit = async (req, res) => {
    try {
    const id = req.params.id;
    const categories = await Category.find({deleted: false});
    const products = await Product.findById(id)
    if (!products) {
       return res.status(404).send("Product not found");
    }
        res.render('product-edit',{products: [products,
       categories]
    })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

 
//<------------ admin product edit -------------->
const editProduct = async (req, res) => {
    try {
        const productImages = req.files.map(file => file.filename);
        const { productName, category, description, brand, color, price, size, stock, extras } = req.body;
        const updatedFields = {
            productName : productName,
            category: category,
            description: description,
            brand : brand,
            stock : stock,
            color : color,
            price : price,
            size : size,
            extras : extras,
            productImage : productImages};
        const productId = req.params.id; 
        const product = await Product.findByIdAndUpdate(productId, updatedFields, { new: true });
        if (!product) {
             return res.send('error');
        }
        return res.redirect('/admin/product-list');
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
};

//<------------ search products -------------->
const searchProduct = async(req, res) => {
    try {
       const limit = 4;
       const input = req.query.searchTerm;
       const products = await Product.find({ category: input }).limit(limit);
       const total = await Product.find({ category: input }).count();
       const category = await Product.findOne({category : input});

      
       const totalProduct = total / 4;
       res.render('search', { products , category:category.category , totalProduct});

    } catch (error) {
       console.log(error);
       
        res.render('error')
   
    }   
 };


//<------------ advanced search  -------------->
const getLowToHigh = async (req, res) => {
    try {
       const limit = 4;
        const input = req.params.id;
        const category = await Product.findOne({category : input});
            const total = await Product.find({category : input}).count();
          const totalProduct = total / 4;
            const products = await Product.find({ category: input }).sort({price : 1}).limit(limit);
        res.render('search', { products, category :category.category, totalProduct }); 
     
    } catch (error) {
        console.log(error.message);
    }
};

const getHighToLow = async (req, res) => {
    try {
        const limit = 4;
          const input = req.params.id;

        const category = await Product.findOne({category : input});
            const total = await Product.find({category : input}).count();
    const totalProduct = total / 4;
            
        const products = await Product.find({ category: input }).sort({price : -1}).limit(limit);
    res.render('search', { products, category :category.category, totalProduct }); 
     
    } catch (error) {
        console.log(error.message);
    }
};

const getnewArrivals = async (req, res) => {
    try {
        const limit = 4;
          const input = req.params.id;
        const category = await Product.findOne({category : input});
            const total = await Product.find({category : input}).count();
          const totalProduct = total / 4;
            const products = await Product.find({extras: "newArrivals"}).limit(limit);
    res.render('search', { products, category :category.category, totalProduct }); 
  
     
    } catch (error) {
        console.log(error.message);
    }
};

const getAtoZ = async (req, res) => {
    try {
        const limit = 4;
          const input = req.params.id;
        const category = await Product.findOne({category : input});
            const total = await Product.find({category : input}).count();
          const totalProduct = total / 4;
            const products = await Product.find({ category: input }).sort({productName : 1}).limit(limit);
    res.render('search', { products, category :category.category, totalProduct }); 
     
    } catch (error) {
        console.log(error.message);
    }
};

const getZtoA = async (req, res) => {
    try {
        const limit = 4;
          const input = req.params.id;
        const category = await Product.findOne({category : input});
        const total = await Product.find({category : input}).count();
      const totalProduct = total / 4;
        const products = await Product.find({ category: input }).sort({productName : -1}).limit(limit);
    res.render('search', { products, category :category.category, totalProduct }); 
     
    } catch (error) {
        console.log(error.message);
    }
};

//<------------ pagination -------------->
const getPagination = async (req, res) =>  {
    try {
       
    
         const page = req.params.id;
       const cat = req.params.cat;
        
        limit = 4;
        const products = await Product.find({category : cat})
        .skip((page - 1) * limit).limit(limit) 
         
        
        const total = await Product.find().count();
        const category = await Product.findOne({category : cat});

        const totalProduct = total / 4;
       
        res.render('search', { products , category:category.category , totalProduct});
        console.log('THE PRODUCT : ',products)
        
    } catch (error) {
        console.log(error.message);
    }
}
 

module.exports = {
    getProduct,
    loadProduct,
    insertProduct,
    deleteProduct,
    searchProduct,
    loadProductEdit,
    editProduct,
    getLowToHigh,
    getHighToLow,
    getnewArrivals,
    getAtoZ,
    getZtoA,
    getPagination
};