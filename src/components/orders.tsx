import React, { useEffect, useState } from 'react';
import { useOrders } from '../services/api-service';
import Swal from 'sweetalert2';
import Navbar from './navbar';
import axios from 'axios';

interface OrderUpdateData {
  order_id: string;
  order_status: 'placed' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'cancelled' | 'completed';
}

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
  order_status: OrderUpdateData['order_status'];
  name: string;
  email: string;
  order_date: string;
  special_instruction: string;
  isPaid: boolean;
  mode_of_payment: string;
  payment_id: string;
  products: Product[];
}

interface OrderResponse {
  success: boolean;
  data: Order[];
}

const statusOptions = [
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'cancelled', label: 'Cancel' }
];

const mapStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    ready_for_pickup: 'Ready for Pickup',
    placed: 'Placed',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    completed: 'Completed'
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { getOrders, updateOrder } = useOrders();

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      const orderResponse = response.data as OrderResponse;
      if (orderResponse.success) {
        const filteredOrders = orderResponse.data.filter(
          (order) =>
            order.order_status !== 'cancelled' &&
            order.order_status !== 'completed'
        );
        setOrders(filteredOrders);

        if (selectedOrder) {
          const updatedOrder = filteredOrders.find(
            (order) => order.order_id === selectedOrder.order_id
          );
          if (updatedOrder) {
            setSelectedOrder({ ...selectedOrder, ...updatedOrder });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderStatusUpdate = async (order: Order) => {
    if (order.order_status === 'cancelled') {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to cancel this order. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel it!'
      });

      if (!result.isConfirmed) {
        const originalOrder = orders.find(o => o.order_id === order.order_id);
        if (originalOrder && selectedOrder) {
          setSelectedOrder({ ...selectedOrder, order_status: originalOrder.order_status });
        }
        return;
      }
    }

    try {
      const updateData: OrderUpdateData = {
        order_id: order.order_id,
        order_status: order.order_status
      };

      const response = await updateOrder(updateData);

      if (response.data.success) {
        Swal.fire({
          title: 'Success',
          text: 'Order status updated successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        if (order.order_status === 'cancelled') {
          setOrders(orders.filter(o => o.order_id !== order.order_id));
          if (selectedOrder?.order_id === order.order_id) {
            setSelectedOrder(null);
          }
        } else {
          fetchOrders();
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      let errorMessage = 'Failed to update order status. Please try again.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error'
      });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 rounded-lg dark:border-gray-700 mt-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column: Table of orders */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm text-gray-600">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-6 py-4 text-left font-medium text-gray-800 uppercase">Order ID</th>
                      <th className="px-6 py-4 text-left font-medium text-gray-800 uppercase">Status</th>
                      <th className="px-6 py-4 text-left font-medium text-gray-800 uppercase">Date</th>
                      <th className="px-6 py-4 text-left font-medium text-gray-800 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.order_id}
                        className={`border-b hover:bg-gray-100 ${selectedOrder?.order_id === order.order_id ? 'bg-blue-100' : ''
                          }`}
                      >
                        <td className="px-6 py-4">{order.order_id}</td>
                        <td className={`px-6 py-4 font-semibold ${order.order_status === 'confirmed' ? 'text-green-600' :
                            order.order_status === 'placed' ? 'text-yellow-600' :
                              order.order_status === 'preparing' ? 'text-blue-600' :
                                order.order_status === 'ready_for_pickup' ? 'text-orange-600' : ''
                          }`}>
                          {mapStatus(order.order_status)}
                        </td>
                        <td className="px-6 py-4">{order.order_date}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-full text-xs px-4 py-2 shadow-sm transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column: Order details */}
            {selectedOrder && (
              <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                  Order Details
                </h2>
                <div className="space-y-6">
                  {/* Order Information */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Order ID:</strong> {selectedOrder.order_id}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Status:</strong>
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ml-2 ${selectedOrder.order_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          selectedOrder.order_status === 'placed' ? 'bg-yellow-100 text-yellow-700' :
                            selectedOrder.order_status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                              selectedOrder.order_status === 'ready_for_pickup' ? 'bg-orange-100 text-orange-700' : ''
                        }`}>
                        {mapStatus(selectedOrder.order_status)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Order Date:</strong> {selectedOrder.order_date}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Pickup Time:</strong> {new Date(selectedOrder.pickup_time).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Total Amount:</strong> P{selectedOrder.total_amount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Payment Status:</strong> {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Payment Method:</strong> {selectedOrder.mode_of_payment}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Special Instruction:</strong>
                      {selectedOrder.special_instruction ||
                        <span className="text-gray-400">No special instruction assigned</span>}
                    </p>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm dark:bg-gray-700">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      Customer Information
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Name:</strong> {selectedOrder.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Email:</strong> {selectedOrder.email}
                    </p>
                  </div>

                  {/* Products List */}
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                      Products
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.products.map((product) => (
                        <div key={product.orderitem_id} className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg shadow-sm dark:bg-gray-700">
                          <img
                            src={product.prod_img}
                            alt={product.product_name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {product.product_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {product.description}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Quantity:</strong> {product.quantity}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Unit Price:</strong> P{product.unit_price}
                            </p>
                            {product.special_instruction && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Special Instruction:</strong> {product.special_instruction}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        Order Status:
                      </label>
                      <div className="flex gap-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => setSelectedOrder({
                              ...selectedOrder,
                              order_status: status.value as Order['order_status']
                            })}
                            className={`px-4 py-2 rounded-full text-xs font-medium ${selectedOrder.order_status === status.value
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleOrderStatusUpdate(selectedOrder)}
                        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;