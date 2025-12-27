import express from "express";
import 'dotenv/config'
import adminRouter from "./routes/adminRoute.js"
import userRouter from './routes/userRoute.js'
import orderRouter from "./routes/ordersRoute.js";
import cartRouter from "./routes/cartRoute.js";
import deliveryRouter from "./routes/deliveryRoute.js";
import cors from 'cors'
import connectCloudinary from "./config/cloudinary.js";
import productRouter from "./routes/ProductRoute.js";
import taxRouter from "./routes/taxRoute.js";


//App config
const app = express();
const port = process.env.PORT || 4000
connectCloudinary();


//Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);





//Api endpoint
app.get('/',(req,res)=>{
    res.send("API WORKING")
})

//api endpoint for user route
app.use('/api/user', userRouter)

//api endpoint for product
app.use('/api/products',productRouter)

//Api endpoint for orders
app.use('/api/orders',orderRouter)

//Api endpoint for cart
app.use('/api/cart',cartRouter)

//Api for delivery 
app.use("/api/delivery", deliveryRouter);



//Api for tax Router
app.use('/api/tax',taxRouter)

//Api for admin Router
app.use('/api/admin', adminRouter);




app.listen(port,()=>{
    console.log(`Server started on Port ${port}`)
})

