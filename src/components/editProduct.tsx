import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../services/api-service';
import Swal from 'sweetalert2';
import Navbar from './navbar';

interface ProductData {
  product_id: string;
  product_name: string;
  description: string;
  category: string;
  price: number;
  availability: string;
  quantity: number;
  prod_img?: string;
  previewImage?: string;
}

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, updateProduct } = useProducts();

  const [product, setProduct] = useState<ProductData>({
    product_id: '',
    product_name: '',
    description: '',
    category: '',
    price: 0,
    availability: '0',
    quantity: 0,
    prod_img: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) {
        console.error('No product ID provided');
        navigate('/vendor/products/view');
        return;
      }

      try {
        const response = await getProductById(id);
        if (response.data?.success) {
          const productData = response.data.data;
          setProduct({
            product_id: id,
            product_name: productData.product_name || '',
            description: productData.description || '',
            category: productData.category || '',
            price: productData.price || 0,
            availability: productData.availability || '0',
            quantity: productData.quantity || 0,
            prod_img: productData.prod_img || null,
          });
        } else {
          console.error('Product not found or invalid response:', response);
          await Swal.fire('Error', 'Product not found', 'error');
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        await Swal.fire('Error', 'Failed to fetch product data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      fetchProductData();
    }
  }, [id, navigate, getProductById, isLoading]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setSelectedImage(files[0]);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProduct(prev => ({
          ...prev,
          previewImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleUpdateProduct = async () => {
    try {
      const productDataToUpdate = {
        ...product,
        product_id: id,
      };

      const response = await updateProduct(product, selectedImage);
      
      if (response.data.success) {
        await Swal.fire({
          title: 'Success!',
          text: 'Product updated successfully.',
          icon: 'success',
          confirmButtonText: 'Okay',
        });
        navigate('/vendor/products/view');
      } else {
        await Swal.fire({
          title: 'Error!',
          text: 'Error updating product.',
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'There was an issue updating the product. Please try again later.',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="p-4 sm:ml-64">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
          {/* Basic Information Card */}
          <div className="p-4 shadow-lg rounded-lg bg-white">
            <h2 className="font-semibold text-xl mb-2">Basic Information</h2>
            <div className="p-4 shadow-lg rounded-lg bg-white border-2">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  name="product_name"
                  value={product.product_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter product name"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="productDescription"
                  name="description"
                  rows={3}
                  value={product.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          </div>

          {/* Product Image Upload Card */}
          <div className="p-4 shadow-lg rounded-lg bg-white">
            <h2 className="font-semibold text-xl mb-2">Product Image</h2>
            <div className="p-4 shadow-lg rounded-lg bg-white border-2">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              </div>

              {!product.previewImage && product.prod_img && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={product.prod_img}
                    alt="Current product"
                    className="max-h-64 rounded-lg shadow-md transition transform hover:scale-105"
                  />
                </div>
              )}

              {product.previewImage && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={product.previewImage}
                    alt="Preview"
                    className="max-h-64 rounded-lg shadow-md transition transform hover:scale-105"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Category Card */}
          <div className="h-44 p-4 shadow-lg rounded-lg bg-white">
            <h2 className="font-semibold text-xl mb-2">Category</h2>
            <div className="p-4 shadow-lg rounded-lg bg-white border-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Product Category
              </label>
              <select
                id="category"
                name="category"
                value={product.category}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Food">Food</option>
                <option value="Drinks">Drinks</option>
              </select>
            </div>
          </div>

          {/* Price Card */}
          <div className="p-4 shadow-lg rounded-lg bg-white">
            <h2 className="font-semibold text-xl mb-2">Price</h2>
            <div className="p-4 shadow-lg rounded-lg bg-white border-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Product Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter product price"
              />
            </div>
          </div>

          {/* Availability and Quantity Card */}
          <div className="p-4 shadow-lg rounded-lg bg-white">
            <h2 className="font-semibold text-xl mb-2">Availability and Quantity</h2>
            <div className="p-4 shadow-lg rounded-lg bg-white border-2">
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                Availability
              </label>
              <select
                id="availability"
                name="availability"
                value={product.availability}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="1">Available</option>
                <option value="0">Out of Stock</option>
              </select>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mt-4">
                Quantity (optional)
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={product.quantity}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter quantity"
              />
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleUpdateProduct}
            type="button"
            className="px-6 py-2 bg-purple-500 text-white rounded-md shadow hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            Save Changes
          </button>
          <button
            onClick={() => navigate('/vendor/products/view')}
            type="button"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default EditProduct;