import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { token, backendUrl, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  // Fetch buyer's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token
          },
        });
        console.log(response.data)
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // toast.error('Failed to load orders');
      }
    };

    fetchOrders();
  }, [token, backendUrl]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div key={index} className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-6 text-sm">
                <img src={order.product_images ? order.product_images[0] : 'default_image_url'} className="w-16 sm:w-20" />
                <div>
                  <p className="sm:text-base font-medium">{order.product_name}</p>
                  <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                    <p className="text-lg">Total: {currency}{order.total_amount}</p>
                    <p>Quantity: {order.quantity}</p>
                  </div>

                  <p className="mt-2">Seller: <span className="text-gray-400">{order.seller_name}</span></p>
                  <p className="mt-2">Date: <span className="text-gray-400">{new Date(order.order_date).toLocaleDateString()}</span></p>
                </div>
              </div>

              <div className="md:w-1/2 flex justify-between">
                <div className="flex items-center gap-2">
                  <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                  <p className="text-sm md:text-base">{order.order_status}</p>
                </div>

                <button className="border px-4 py-2 text-sm font-medium rounded-sm cursor-pointer">Track Order</button>
              </div>
            </div>
          ))
        ) : (
          <p>No orders to display</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
