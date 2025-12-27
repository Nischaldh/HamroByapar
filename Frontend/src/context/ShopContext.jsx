import { createContext, useEffect, useState } from "react";
// import { products } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'


export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = 'Rs ';
    const [cartItems, setCartItems] = useState({})
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [userRole, setUserRole] = useState('')
    const [userName, setUserName] = useState('Name');
    const [userEmail, setUserEmail] = useState('Email');
    const [userPassword, setUserPassword] = useState('');
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [token, setToken] = useState(localStorage.getItem("token") || "");


    const fetchCartItems = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; // Don't fetch if not logged in

            const response = await axios.get(`${backendUrl}/api/cart/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let cartData = {};
            response.data.forEach(item => {
                cartData[item.product_id] = {
                    ...item,
                    quantity: item.quantity // Ensure quantity is stored correctly
                };
            });

            setCartItems(cartData); // Update cart state
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    };
    useEffect(() => {
        fetchCartItems();  // Fetch cart from backend
    }, []);


    const addToCart = async (item) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            if (userRole === 'seller') {
                toast.error("You cannot order as a seller!");
                return; // Prevent adding to cart
            }
    

            // Send request to backend
            await axios.post(`${backendUrl}/api/cart/add`,
                { product_id: item.id, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setCartItems((prevCart) => {
                let cartData = structuredClone(prevCart);

                if (cartData[item.id]) {
                    cartData[item.id].quantity += 1;
                } else {
                    cartData[item.id] = { ...item, quantity: 1 };
                }

                return cartData;
            });

        } catch (error) {
            console.error('Error adding item to cart:', error);
        }
    };


    const getCartCount = () => {
        return Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
    };
  
    const updateQuantity = (itemId, quantity) => {
        setCartItems((prev) => {
            let updatedCart = structuredClone(prev);

            // Prevent deletion if the input is empty or invalid
            if (quantity === "" || isNaN(quantity)) {
                return updatedCart;  // Do nothing if the input is empty
            }

            if (updatedCart[itemId]) {
                if (quantity > 0) {
                    updatedCart[itemId].quantity = quantity; // Update quantity
                } else {
                    delete updatedCart[itemId]; // Remove item if quantity is 0
                }
            }
            return updatedCart;
        });
    };

    const updateCartInBackend = async (productId, quantity) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            await axios.post(`${backendUrl}/api/cart/update`,
                { product_id: productId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCartItems((prev) => {
                let updatedCart = structuredClone(prev);
                if (updatedCart[productId]) {
                    updatedCart[productId].quantity = quantity;
                }
                return updatedCart;
            });

        } catch (error) {
            console.error("Error updating cart quantity:", error);
        }
    };



    const removeFromCart = async (productId) => {
        const token = localStorage.getItem('token'); 

        try {
            const response = await axios.post(
                `${backendUrl}/api/cart/remove`, 
                { product_id: productId }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Item removed:', response.data);

            
            setCartItems((prev) => {
                let updatedCart = structuredClone(prev);
                delete updatedCart[productId];
                return updatedCart;
            });

        } catch (error) {
            console.error(`Error removing product ${productId} from cart:`, error.response?.data || error.message);
        }
    };


    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            const item = cartItems[itemId];
            totalAmount += item.price * item.quantity; // Price * quantity for each item
        }
        return totalAmount;
    };

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + "/api/products/list/all")

            console.log(response.data)
            if (response.data.success) {
                setProducts(response.data.products)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)

        }
    }

    useEffect(() => {
        getProductsData();

    }, [])
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUserRole = localStorage.getItem("userRole");

        if (storedToken) {
            setToken(storedToken);
            setIsLoggedIn(true);
            setUserRole(storedUserRole || "buyer");
        }
    }, []);

    // Function to handle login and store token
    const handleLogin = (token, user) => {
        setToken(token);
        setIsLoggedIn(true);
        setUserRole(user.role);
        if (user.name) setUserName(user.name);
        if (user.email) setUserEmail(user.email);

        localStorage.setItem("token", token);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userName", user.name);  // Store in localStorage
        localStorage.setItem("userEmail", user.email);

    };

    // Function to handle logout
    const handleLogout = () => {
        setToken("");
        setIsLoggedIn(false);
        setUserRole("");
        setCartItems({})
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
    };
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUserRole = localStorage.getItem("userRole");
        const storedUserName = localStorage.getItem("userName");
        const storedUserEmail = localStorage.getItem("userEmail");

        if (storedToken) {
            setToken(storedToken);
            setIsLoggedIn(true);
            setUserRole(storedUserRole || "buyer");

            if (storedUserName) setUserName(storedUserName);
            if (storedUserEmail) setUserEmail(storedUserEmail);
        }
    }, []);


    const cartTotal = getCartAmount();



    const value = {
        products, currency, cartItems, addToCart, getCartCount, updateQuantity, removeFromCart,
        getCartAmount, navigate, isLoggedIn, setIsLoggedIn, isSeller, setIsSeller, userRole, setUserRole,
        backendUrl, token, setToken, handleLogin, handleLogout, userName, userEmail, setUserEmail, setUserName,cartTotal,
    }
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider