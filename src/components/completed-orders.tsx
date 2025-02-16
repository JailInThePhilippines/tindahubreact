import React, { useEffect, useState } from 'react';
import { useOrders } from '../services/api-service';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  orderitem_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  special_instruction: string;
  product_name: string;
  description: string;
  price: number;
  prod_img: string;
  category: string;
}

interface Order {
  order_id: string;
  user_id: string;
  vendor_id: string;
  total_amount: number;
  pickup_time: string;
  order_status: string;
  name: string;
  email: string;
  order_date: string;
  special_instruction: string;
  isPaid: boolean;
  mode_of_payment: string;
  payment_id: string;
  products: Product[];
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    page: number;
    per_page: number;
    total: number;
  };
}

const CompletedOrders = () => {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  
  const orders = useOrders();

  const getModeOfPayment = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'Cash-On-Pickup': 'Cash on Pickup',
      'Gcash': 'Cashless: Gcash',
    };
    return statusMap[status] || status;
  };

  const loadOrders = async () => {
    try {
      const response = await orders.getCompletedOrders(currentPage, perPage);
      if (response.data.success) {
        setCompletedOrders(response.data.data.orders);
        setTotalPages(Math.ceil(response.data.data.total / perPage));
      }
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Transaction History</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse bg-white shadow-lg rounded-lg">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="px-4 py-2 border-b text-left">Order ID</th>
              <th className="px-4 py-2 border-b text-left">Items</th>
              <th className="px-4 py-2 border-b text-left hidden sm:table-cell">Total Amount</th>
              <th className="px-4 py-2 border-b text-left">Order Date</th>
              <th className="px-4 py-2 border-b text-left">Mode of Payment</th>
              <th className="px-4 py-2 border-b text-left hidden md:table-cell">Payment ID (Cashless)</th>
            </tr>
          </thead>
          <tbody>
            {completedOrders.map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-100 transition duration-300 ease-in-out">
                <td className="px-4 py-2 border-b text-gray-800">
                  #UNMPEXP{order.order_id}
                </td>
                <td className="px-4 py-2 border-b text-gray-600">
                  <ul className="list-disc pl-5">
                    {order.products.map((item) => (
                      <li key={item.orderitem_id}>
                        <strong className="text-gray-900">{item.product_name}</strong>
                        ({item.quantity} x {item.unit_price} PHP)
                        <br />
                        <small className="text-gray-500">{item.description}</small>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2 border-b text-gray-800 hidden sm:table-cell">
                  {order.total_amount} PHP
                </td>
                <td className="px-4 py-2 border-b text-gray-800">
                  {order.order_date}
                </td>
                <td className="px-4 py-2 border-b text-green-800">
                  {getModeOfPayment(order.mode_of_payment)}
                </td>
                <td className="px-4 py-2 border-b text-gray-800 hidden md:table-cell">
                  {order.payment_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={previousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-200 text-white rounded disabled:bg-gray-300 flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded disabled:bg-gray-300 flex items-center"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default CompletedOrders;