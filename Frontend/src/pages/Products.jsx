/* eslint-disable react-hooks/exhaustive-deps */
import  { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets.js'
import Title from '../components/Title.jsx'
import ProductItem from '../components/ProductItem.jsx'

const Products = () => {
  const { products } = useContext(ShopContext)
  const [showFilter, setShowFilter] = useState(false)
  const [filterProducts, setFilterProducts] = useState([])
  const [category, setCategory] = useState([])
  const [sortType, setSortType] = useState('relavent')
  const [searchTerm, setSearchTerm] = useState('')

  const toggleCateogry = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };
  const applyFilter = () => {
    if (!products || products.length === 0) return; // ✅ Ensure products exist before filtering

    let productsCopy = [...products];

    // ✅ Apply category filter
    if (category.length > 0) {
        productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }

    // ✅ Apply search filter
    if (searchTerm.trim() !== '') {
        productsCopy = productsCopy.filter((item) =>
            item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) // ✅ Use correct key
        );
    }

    setFilterProducts(productsCopy);
};



  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => (a.price - b.price)));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => (b.price - a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    setFilterProducts(products);
  }, [products]);

  useEffect(() => {
    applyFilter();
  }, [category, searchTerm,products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* --------Filter Options--------- */}
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img src={assets.dropdown_icon} className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} />
        </p>
        {/* --------Category Filter---------- */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <label className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Books'} onChange={toggleCateogry} /> Books & Learning
            </label>
            <label className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Beauty'} onChange={toggleCateogry} /> Beauty & Health
            </label>
            <label className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Pets'} onChange={toggleCateogry} /> Pets & Pet Care
            </label>
            <label className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Electronics'} onChange={toggleCateogry} /> Electronics
            </label>
          </div>
        </div>
      </div>

      {/* -------Right Side------ */}
      <div className='flex-1'>
        <div className='flex flex-col sm:flex-row justify-between items-center text-base sm:text-2xl mb-4 gap-3'>
          <Title text1={"Browse All"} text2={"Products"} />

          {/* Search and Sort Container */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
            {/* -------Search Bar with Right Icon------ */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search products..."
                className="border border-gray-300 text-sm px-4 py-1 pr-8 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <img
                src={assets.search}
                alt="Search"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer"
              />
            </div>

            {/* ------Product Sort Dropdown----- */}
            <select className='border-2 border-gray-300 text-sm px-2 py-1 rounded-md' onChange={(e) => setSortType(e.target.value)}>
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
          </div>
        </div>

        {/* -------Products Grid------- */}
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterProducts.map((item, index) => (
              <ProductItem key={index} id={item.id} images={item.images||[]} name={item.product_name} price={item.price} seller={item.seller_name} />
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Products
