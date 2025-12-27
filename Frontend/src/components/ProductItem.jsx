import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const ProductItem = ({ id, images = [], name, price, seller }) => {
    const { currency } = useContext(ShopContext);

    // Ensure images exist and pick the first image or use a placeholder
    const imageUrl = images.length > 0 ? images[0] : '/fallback-image.jpg';

    return (
        <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
            <div className='overflow-hidden'>
                <img 
                    src={imageUrl} 
                    alt={name} 
                    className='hover:scale-110 transition ease-in-out w-full h-90 object-cover' 
                />
            </div>
            <p className='pt-3 pb-1 text-xl'>{name}</p>
            <p className='text-sm font-medium'>{seller}</p>
            <p className='text-sm font-medium'>{currency}{price}</p>
        </Link>
    );
};

export default ProductItem;
