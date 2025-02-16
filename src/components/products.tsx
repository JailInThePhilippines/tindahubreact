import { useEffect, useState } from 'react';
import Navbar from './navbar';
import { useProducts } from '../services/api-service';
import Swal from 'sweetalert2';
import { Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProductDetailsModal, { ProductDetailsButton } from './productDetailsModal';

const Products = () => {
  const { searchProducts, deleteProduct } = useProducts();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const openProductDetails = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await searchProducts(searchTerm, selectedCategory);
      if (response?.data?.success) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to undo this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteProduct(productId);
          fetchProducts();
          Swal.fire('Deleted!', 'Product has been deleted.', 'success');
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete product.', 'error');
        }
      }
    });
  };

  const handleEdit = (productId: number) => {
    navigate(`/vendor/products/edit/${productId}`);
  };

  return (
    <div>
      <Navbar />
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center z-10">
          <CircularProgress />
        </div>
      )}
      <div className="p-4 sm:ml-64">
        <div className="overflow-x-auto mt-14">
          <div className="flex justify-end p-4 w-full">
            <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="flex items-center w-full max-w-lg">
              <div className="relative">
                <Button
                  variant="contained"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium"
                >
                  {selectedCategory || "All"}
                </Button>
                {dropdownOpen && (
                  <div className="absolute bg-white shadow rounded-lg mt-1 w-44">
                    <Button onClick={() => { setSelectedCategory(null); setDropdownOpen(false); }} className="w-full">All</Button>
                    <Button onClick={() => { setSelectedCategory('Food'); setDropdownOpen(false); }} className="w-full">Food</Button>
                    <Button onClick={() => { setSelectedCategory('Drinks'); setDropdownOpen(false); }} className="w-full">Drinks</Button>
                  </div>
                )}
              </div>
              <input
                type="search"
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block p-2.5 w-full text-sm border border-gray-300 rounded-none"
                placeholder="Search products..."
                required
              />
              <Button type="submit" variant="contained" color="primary" className="p-2.5">
                🔍
              </Button>
            </form>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {products.map((product) => (
              <div key={product.product_id} className="border border-blue-900 rounded-lg shadow hover:shadow-lg transition duration-300 p-4 flex flex-col justify-between">
                <div>
                  <img src={product.prod_img} alt={product.product_name} className="w-full h-32 object-cover rounded mb-4" />
                  <h3 className="font-bold text-lg mb-2">{product.product_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Category: {product.category}</p>
                  <p className="text-sm text-gray-600 mb-2">Price: ₱{product.price}</p>
                  <p className="text-sm text-gray-600 mb-4">Quantity: {product.quantity}</p>
                  <span className={product.availability ? 'bg-green-100 text-green-700 px-2 py-1 rounded text-xs' : 'bg-red-100 text-red-700 px-2 py-1 rounded text-xs'}>
                    {product.availability ? "Available" : "Out of Stock"}
                  </span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="contained" color="primary" onClick={() => handleEdit(product.product_id)}>Edit</Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(product.product_id)}>Delete</Button>
                  <ProductDetailsButton
                    product={product}
                    onClick={() => openProductDetails(product)}
                  />
                  {selectedProduct && (
                    <ProductDetailsModal
                      product={selectedProduct}
                      isOpen={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
