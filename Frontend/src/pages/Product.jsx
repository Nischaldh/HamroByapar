import React, { useContext, useEffect, useState } from 'react'
import { useAsyncError, useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import RelatedProducts from '../components/RelatedProducts'
import axios from 'axios';

const Product = () => {
    const { productId } = useParams();
    const { products, currency, addToCart, backendUrl } = useContext(ShopContext)
    const [productData, setProductData] = useState(null)
    const [image, setImage] = useState('');
    
    // const handleAddToCart = async () => {
    //     if (!productData) return;

    //     const token = localStorage.getItem('token'); // Get token from localStorage

    //     try {
    //         const response = await axios.post(
    //             `${backendUrl}/api/cart/add`,
    //             {
    //                 product_id: productData.id, 
    //                 quantity: 1, // Default quantity
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             }
    //         );

    //         console.log('Item added to cart:', response.data);
    //         addToCart(productData); // Update frontend cart state
    //     } catch (error) {
    //         console.error('Error adding item to cart:', error);
    //     }
    // };


    useEffect(() => {
        // Find the product with the matching ID
        const foundProduct = products.find((item) => item.id === productId);

        if (foundProduct) {
            setProductData(foundProduct);
            setImage(foundProduct.images[0]); // ✅ Corrected this line
        } else {
            console.log("Product not found");
        }
    }, [productId, products]);
    // Dependencies

    return productData ? (
        <div className='border-t-2 pt-10 transition-opactiy ease-in duratoin-500 opacity-100'>
            {/* Product Data */}
            <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
                {/* Images */}
                <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
                    <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
                        {productData.images.map((item, index) => (
                            <img
                                onClick={() => setImage(item)}
                                src={item}
                                key={index}
                                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                                alt=""
                            />
                        ))}
                    </div>
                    <div className='w-full sm:w-[80%]'>
                        <img src={image} alt="" className='w-full h-auto' />
                    </div>
                </div>
                {/* -------Product Information--------- */}
                <div className='flex-1'>
                    <h1 className='font-medium text-2xl mt-2'>{productData.product_name}</h1>
                    <p className='font-medium text-md mt-2'>Seller: {productData.seller_name}</p>
                    <p className="mt-5 text-3xl font-medium">
                        {currency} {productData.price}
                    </p>
                    <p className="mt-5 text-gray-500 md:w-4/5">
                        Description: {productData.description}
                    </p>
                    <p className="mt-5 text-gray-500 md:w-4/5">
                        Category: {productData.category}
                    </p>
                    <button className="my-8 bg-black text-white px-8 py-3 text-sm active:bg-gray-700 cursor-pointer" onClick={() => addToCart(productData)}>
                        ADD TO CART
                    </button>
                    <hr className="mt-8 sm:w-4/5" />
                    <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
                        <p>100% Original Product</p>
                        <p>Cash on Delivery is available on this product</p>
                        <p>Easy return and exchange policy within 7 days</p>
                    </div>


                </div>


            </div>
            <RelatedProducts  category={productData.category} />


        </div>
    ) : 
        <div className="text-center text-gray-500 py-10">
            <p>Product not found.</p>
        </div>
}

export default Product