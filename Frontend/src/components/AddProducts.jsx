// eslint-disable-next-line no-unused-vars
import React, { useState, useContext } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';

const AddProducts = () => {
    const { token, backendUrl } = useContext(ShopContext);
    const [images, setImages] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("Books");

    // Handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Validate file type before adding
        const validFiles = files.filter(file => {
            return ["image/jpeg", "image/jpg", "image/png"].includes(file.type);
        });

        if (validFiles.length + images.length > 4) {
            toast.error("You can upload a maximum of 4 images.");
            return;
        }

        setImages(prev => [...prev, ...validFiles].slice(0, 4));
    };

    // Remove image from selection
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!name || !price || !stock || images.length === 0) {
            toast.error("Please fill all required fields and add at least one image.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("stock", stock);
            formData.append("category", category);

            images.forEach((image) => {
                formData.append("images", image);
            });

            const response = await axios.post(`${backendUrl}/api/products/add`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                toast.success("Product Added Successfully");

                // Clear form after submission
                setName("");
                setDescription("");
                setPrice("");
                setStock("");
                setCategory("Books");
                setImages([]);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
            <div>
                <p className='mb-2'>Upload Image (Max: 4)</p>
                <input type="file" multiple onChange={handleImageChange} accept="image/png, image/jpeg" />
                <div className='flex gap-2 mt-2'>
                    {images.map((image, index) => (
                        <div key={index} className="relative">
                            <img className='w-20 h-20 object-cover rounded' src={URL.createObjectURL(image)} alt="" />
                            <button 
                                type="button" 
                                className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full" 
                                onClick={() => removeImage(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className='w-full'>
                <p className='mb-2'>Product Name</p>
                <input type="text" onChange={(e) => setName(e.target.value)} value={name} placeholder='Type Here' required className='w-full max-w-[500px] py-2 px-3' />
            </div>
            <div className='w-full'>
                <p className='mb-2'>Product Description</p>
                <textarea onChange={(e) => setDescription(e.target.value)} value={description} placeholder='Write Content Here' required className='w-full max-w-[500px] py-2 px-3' />
            </div>
            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                <div>
                    <p className='mb-2'>Product Category</p>
                    <select className='w-full px-3 py-2' onChange={(e) => setCategory(e.target.value)} value={category}>
                        <option value="Books">Books & Learning</option>
                        <option value="Beauty">Beauty & Health</option>
                        <option value="Pets">Pets & Pet Care</option>
                        <option value="Electronics">Electronics</option>
                    </select>
                </div>
                <div>
                    <p className='mb-2'>Product Price</p>
                    <input className='w-full px-3 py-2 sm:w-[120px]' type="number" placeholder='25' onChange={(e) => setPrice(e.target.value)} value={price} required />
                </div>
                <div>
                    <p className='mb-2'>Stock</p>
                    <input className='w-full px-3 py-2 sm:w-[120px]' type="number" placeholder='10' onChange={(e) => setStock(e.target.value)} value={stock} required />
                </div>
            </div>
            <button type='submit' className='w-28 py-3 mt-4 bg-black text-white cursor-pointer'>ADD</button>
        </form>
    );
};

export default AddProducts;
