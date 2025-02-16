import React, { useState } from 'react';
import { useProducts } from '../services/api-service';
import Navbar from './navbar';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface Variation {
  variation_name: string;
  price: number;
  stock: number;
}

interface ProductData {
  product_name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  availability: number;
  date: string;
  variations: Variation[];
}

const AddProduct = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prodImg, setProdImg] = useState<File | null>(null);

  const [productData, setProductData] = useState<ProductData>({
    product_name: '',
    description: '',
    category: '',
    price: 0,
    quantity: 0,
    availability: 1,
    date: new Date().toISOString().split('T')[0],
    variations: []
  });

  const { postProduct } = useProducts();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setProdImg(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addVariation = () => {
    setProductData(prev => ({
      ...prev,
      variations: [...prev.variations, { variation_name: '', price: 0, stock: 0 }]
    }));
  };

  const removeVariation = (index: number) => {
    setProductData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleVariationChange = (index: number, field: keyof Variation, value: string | number) => {
    setProductData(prev => ({
      ...prev,
      variations: prev.variations.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const resetForm = () => {
    setProductData({
      product_name: '',
      description: '',
      category: '',
      price: 0,
      quantity: 0,
      availability: 1,
      date: new Date().toISOString().split('T')[0],
      variations: []
    });
    setProdImg(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await postProduct(productData, prodImg);
      Swal.fire({
        title: 'Success!',
        text: 'Product has been saved successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#9333ea',
      });
      resetForm();
    } catch (error) {
      console.error('Error posting product:', error);
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'An error occurred while saving the product.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#9333ea',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center z-10">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

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
                  value={productData.product_name}
                  onChange={handleInputChange}
                  name="product_name"
                  type="text"
                  id="productName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter product name"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={productData.description}
                  onChange={handleInputChange}
                  name="description"
                  id="productDescription"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Card */}
          <div className="p-6 shadow-xl rounded-lg bg-white border">
            <h2 className="font-bold text-2xl mb-4 text-gray-800">
              Product Image
            </h2>
            <div className="p-4 shadow-inner rounded-lg bg-gray-50 border-2 border-dashed border-gray-300">
              <div
                className="flex items-center justify-center w-full h-64"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
              >
                <label
                  htmlFor="dropzone-file"
                  className={`flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer transition hover:bg-gray-100 ${isDragging ? 'border-gray-400' : ''
                    }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-4 text-gray-500"
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
                    <p className="mb-2 text-base text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      SVG, PNG, JPG, or GIF (MAX. 800x400px)
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
              {imagePreview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 rounded-lg shadow-md transition transform hover:scale-105"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Category Card */}
          <div className="p-4 shadow-lg rounded-lg bg-white">
            <h2 className="font-semibold text-xl mb-2">Category</h2>
            <div className="p-4 shadow-lg rounded-lg bg-white border-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Product Category
              </label>
              <select
                value={productData.category}
                onChange={handleInputChange}
                name="category"
                id="category"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select category</option>
                <option value="Food">Food</option>
                <option value="Drinks">Drinks</option>
              </select>
            </div>

            {productData.category === 'Drinks' && (
              <div className="mt-4 p-4 shadow-lg rounded-lg bg-white">
                <h2 className="font-semibold text-xl mb-2">Variations</h2>
                <div className="space-y-4">
                  {productData.variations.map((variation, index) => (
                    <div key={index} className="p-4 shadow-lg rounded-lg bg-gray-50 border-2">
                      <h3 className="font-semibold text-lg mb-2">Variation {index + 1}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Variation Name
                          </label>
                          <input
                            value={variation.variation_name}
                            onChange={(e) => handleVariationChange(index, 'variation_name', e.target.value)}
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            placeholder="Enter variation name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Price
                          </label>
                          <input
                            value={variation.price}
                            onChange={(e) => handleVariationChange(index, 'price', Number(e.target.value))}
                            type="number"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            placeholder="Enter variation price"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Stock
                          </label>
                          <input
                            value={variation.stock}
                            onChange={(e) => handleVariationChange(index, 'stock', Number(e.target.value))}
                            type="number"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            placeholder="Enter variation stock"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariation(index)}
                          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
                        >
                          Remove Variation
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariation}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                  >
                    Add Variation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Card */}
          <div className="p-4 shadow-lg rounded-lg bg-white">
            <h2 className="font-semibold text-xl mb-2">Price</h2>
            <div className="p-4 shadow-lg rounded-lg bg-white border-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Product Price
              </label>
              <input
                value={productData.price}
                onChange={handleInputChange}
                name="price"
                type="number"
                id="price"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter product price"
              />
            </div>
          </div>

          {/* Availability Card */}
          <div className="p-4 shadow-lg rounded-lg bg-white">
            <h2 className="font-semibold text-xl mb-2">Availability and Quantity</h2>
            <div className="p-4 shadow-lg rounded-lg bg-white border-2">
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                Availability
              </label>
              <select
                value={productData.availability}
                onChange={handleInputChange}
                name="availability"
                id="availability"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={1}>Available</option>
                <option value={0}>Out of Stock</option>
              </select>

              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mt-4">
                Quantity (optional, only use when necessary)
              </label>
              <input
                value={productData.quantity}
                onChange={handleInputChange}
                name="quantity"
                type="number"
                id="quantity"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter quantity"
              />
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-purple-500 text-white rounded-md shadow hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            Save
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;