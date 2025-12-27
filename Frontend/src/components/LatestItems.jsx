import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const LatestItems = () => {

    const {products} = useContext(ShopContext)
    const [latestProducts, setLatestProducts] = useState([]);
    useEffect(()=>{
        setLatestProducts(products.slice(0,10))

    },[products])

  return (
    <div className='my-10'>
        <div className='text-center py-8 text-3xl'>
            <Title text1={"NEW"} text2={"PRODUCTS"}/>
            <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>Browse Though Trending Products and pick what you like!</p>
        </div>
        <div>
          {/*---------Rendering Products------- */}
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
            {
              latestProducts.map((item,index)=>(
                <ProductItem key={index} id={item.id} images={item.images} name={item.product_name} price={item.price} seller={item.seller_name} />
              ))
            }

          </div>

        </div>


      
    </div>
  )
}

export default LatestItems
