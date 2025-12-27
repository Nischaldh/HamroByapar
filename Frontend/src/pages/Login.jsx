import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('buyer'); // Default role
  const {backendUrl, token, setToken, navigate, userRole, setUserRole, setIsLoggedIn, handleLogin } = useContext(ShopContext);


  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up") {
          const response = await axios.post(`${backendUrl}/api/user/signup`,{name,email,password,role})
        
      
        if (response.data.success) {
          toast.success("Signup successful!");
          handleLogin(response.data.token,  response.data.user);
          console.log(response.data.token)

        } else {
          toast.error(response.data.message);
        }
  
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, { email, password });
        if (response.data.success) {
          handleLogin(response.data.token, response.data.user);
        } else {
          toast.success("Login successful!");
          toast.error(response.data.message);
        }
        console.log(response.data)
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  useEffect(()=>{
    if(token){
      navigate('/')
    }
  },[token])

  return (
    <div>
      <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
          <p className='text-3xl'>{currentState}</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>
        {currentState === "Sign Up" && (
          <>
            <input type="text" onChange={(e) => setName(e.target.value)} value={name} className='w-full px-3 py-2 border border-gray-800' placeholder='Name' required />
            <select onChange={(e) => setRole(e.target.value)} value={role} className='w-full px-3 py-2 border border-gray-800'>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </>
        )}
        <input type="email" onChange={(e) => setEmail(e.target.value)} value={email} className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required />
        <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} className='w-full px-3 py-2 border border-gray-800' placeholder='Password' required />
        <div className='w-full flex justify-between text-sm mt-[-8px]'>
          <p className='cursor-pointer'>Forgot Your Password?</p>
          {currentState === 'Login' ? (
            <p className='cursor-pointer' onClick={() => setCurrentState('Sign Up')}>Create Account</p>
          ) : (
            <p className='cursor-pointer' onClick={() => setCurrentState('Login')}>Login Here</p>
          )}
        </div>
        <button className='bg-black text-white font-light px-8 py-2 mt-4'>{currentState === "Login" ? "Sign In" : "Sign Up"}</button>
      </form>
    </div>
  );
};

export default Login;
