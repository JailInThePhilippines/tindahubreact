import Navbar from './navbar';
import React, { useEffect, useState, useRef } from 'react';
import ApexCharts from 'apexcharts';
import { useAnalytics } from '../services/api-service';
import CompletedOrders from './completed-orders';

interface SalesData {
  week?: number;
  month?: number;
  year: number;
  total_sales: number | string;
}

interface Product {
  product_name: string;
  prod_img: string;
  total_quantity: number;
}

interface OrdersAndRevenue {
  total_orders: number;
  total_revenue: string;
}


const Dashboard = () => {
  const [weeklySales, setWeeklySales] = useState<SalesData[]>([]);
  const [monthlySales, setMonthlySales] = useState<SalesData[]>([]);
  const [totalSales, setTotalSales] = useState('0');
  const [totalMonthlySales, setTotalMonthlySales] = useState('0');
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useLastMonthData, setUseLastMonthData] = useState(true);
  const [lastMonthLabel, setLastMonthLabel] = useState('');
  const [mostOrderedProducts, setMostOrderedProducts] = useState<Product[]>([]);
  const [mostOrderedProduct, setMostOrderedProduct] = useState<Product[]>([]);

  const weeklyChartRef = useRef<ApexCharts | null>(null);
  const monthlyChartRef = useRef<ApexCharts | null>(null);

  const analytics = useAnalytics();

  const getLastMonthStartDate = () => {
    const date = new Date();
    if (date.getDate() < 15) {
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;
    }
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;
  };

  const getLastMonthEndDate = () => {
    const date = new Date();
    if (date.getDate() < 15) {
      return date.toISOString().split('T')[0];
    }
    date.setMonth(date.getMonth() - 1);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const getLastMonthLabel = () => {
    const date = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (date.getDate() < 15) {
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
    date.setMonth(date.getMonth() - 1);
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const fetchWeeklySales = async () => {
    try {
      const response = await analytics.getWeeklySales();
      if (response.success && Array.isArray(response.data)) {
        setWeeklySales(response.data);
        setTotalSales(response.data[0]?.total_sales?.toString() || '0');
        updateWeeklyChart(response.data);
      } else {
        console.error('Weekly sales data is not in expected format:', response);
      }
    } catch (error) {
      console.error('Error fetching weekly sales:', error);
    }
  };

  const fetchMonthlySales = async () => {
    try {
      const response = await analytics.getMonthlySales();
      if (response.success && Array.isArray(response.data)) {
        setMonthlySales(response.data);
        setTotalMonthlySales(response.data[0]?.total_sales?.toString() || '0');
        updateMonthlyChart(response.data);
      } else {
        console.error('Monthly sales data is not in expected format:', response);
      }
    } catch (error) {
      console.error('Error fetching monthly sales:', error);
    }
  };

  const fetchOrdersAndRevenue = async () => {
    try {
      const formattedStartDate = startDate || getLastMonthStartDate();
      const formattedEndDate = endDate || getLastMonthEndDate();

      const response = await analytics.getTotalOrdersAndRevenue(formattedStartDate, formattedEndDate);
      if (response.success && response.data) {
        const { total_orders, total_revenue } = response.data;
        setTotalOrders(total_orders);
        setTotalRevenue(parseFloat(total_revenue) || 0);
        setUseLastMonthData(!startDate && !endDate);
        setLastMonthLabel((!startDate && !endDate) ? getLastMonthLabel() : '');
      }
    } catch (error) {
      console.error('Error fetching orders and revenue:', error);
    }
  };

  const fetchMostOrderedProducts = async () => {
    try {
      const response = await analytics.getMostOrderedProducts();
      if (response.success && response.data) {
        setMostOrderedProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching most ordered products:', error);
    }
  };

  const fetchMostOrderedProduct = async () => {
    try {
      const response = await analytics.getMostOrderedProduct();
      if (response.success && response.data) {
        setMostOrderedProduct([response.data]);
      }
    } catch (error) {
      console.error('Error fetching most ordered product:', error);
    }
  };

  const updateWeeklyChart = (data: SalesData[]) => {

    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid data format for weekly chart');
      return;
    }

    const salesData = [...data].reverse().map(item =>
      typeof item.total_sales === 'number' ? item.total_sales : parseFloat(item.total_sales)
    );
    const categories = [...data].reverse().map(item => `Week ${item.week}`);

    const options = {
      chart: { type: 'bar', height: '100%' },
      series: [{ name: 'Sales', data: salesData }],
      xaxis: { categories },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        },
      },
      colors: ['#4caf50'],
      dataLabels: { enabled: true },
      title: {
        text: 'Weekly Sales',
        align: 'center',
      },
    };

    if (weeklyChartRef.current) {
      weeklyChartRef.current.updateOptions(options);
    } else {
      weeklyChartRef.current = new ApexCharts(
        document.querySelector('#area-chart'),
        options
      );
      weeklyChartRef.current.render();
    }
  };

  const updateMonthlyChart = (data: SalesData[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid data format for monthly chart');
      return;
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const salesData = [...data].reverse().map(item =>
      typeof item.total_sales === 'number' ? item.total_sales : parseFloat(item.total_sales)
    );
    const categories = [...data].reverse().map(item =>
      `${monthNames[item.month! - 1]} ${item.year}`
    );

    const options = {
      chart: { type: 'line', height: '80%' },
      series: [{ name: 'Sales', data: salesData }],
      xaxis: { categories },
      colors: ['#007bff'],
      stroke: { curve: 'smooth' },
      markers: { size: 5 },
      title: {
        text: 'Monthly Sales',
        align: 'center',
      },
      dataLabels: { enabled: true },
    };

    if (monthlyChartRef.current) {
      monthlyChartRef.current.updateOptions(options);
    } else {
      monthlyChartRef.current = new ApexCharts(
        document.querySelector('#line-chart'),
        options
      );
      monthlyChartRef.current.render();
    }
  };

  useEffect(() => {
    fetchWeeklySales();
    fetchMonthlySales();
    fetchOrdersAndRevenue();
    fetchMostOrderedProducts();
    fetchMostOrderedProduct();

    return () => {
      weeklyChartRef.current?.destroy();
      monthlyChartRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchOrdersAndRevenue();
    }
  }, [startDate, endDate]);

  const filterData = (filterType: string) => {
    const currentWeek = weeklySales[0]?.week || 0;
    const currentYear = weeklySales[0]?.year || 0;

    let filteredSales = weeklySales.filter(item => {
      const weekDifference = (currentYear - item.year) * 52 + (currentWeek - item.week!);
      switch (filterType) {
        case 'last7days':
          return weekDifference >= 0 && weekDifference < 7;
        case 'last30days':
          return weekDifference >= 0 && weekDifference < 30;
        case 'last90days':
          return weekDifference >= 0 && weekDifference < 90;
        default:
          return true;
      }
    });

    setTotalSales(filteredSales
      .reduce((sum, item) => {
        const salesValue = typeof item.total_sales === 'string'
          ? parseFloat(item.total_sales)
          : item.total_sales;
        return sum + salesValue;
      }, 0)
      .toFixed(2)
    );

    updateWeeklyChart(filteredSales);
  };


  return (
    <div>
      <Navbar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 dark:border-gray-700 mt-14 flex flex-col lg:flex-row lg:gap-6">
          {/* Monthly Sales Card */}
          <div className="flex-1 bg-white rounded-lg shadow dark:bg-gray-800 p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-3xl font-bold text-gray-900 dark:text-white pb-2">
                  P{totalMonthlySales}
                </h5>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                  Total sales this month
                </p>
              </div>
            </div>
            <div id="line-chart" className="h-96" />
          </div>
        </div>

        {/* Weekly Sales and Other Cards */}
        <div className="p-4 dark:border-gray-700 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Weekly Sales Card */}
            <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="text-3xl font-bold text-gray-900 dark:text-white pb-2">
                    P{totalSales}
                  </h5>
                  <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Total sales this week
                  </p>
                </div>
              </div>
              <div id="area-chart" />
              <div className="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between pt-5">
                <div className="flex justify-between items-center">
                  <select
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent"
                    onChange={(e) => filterData(e.target.value)}
                  >
                    <option value="last7days">Last 7 weeks</option>
                    <option value="last30days">Last 30 weeks</option>
                    <option value="last90days">Last 90 weeks</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders and Revenue Card */}
            <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                <div>
                  {useLastMonthData && (
                    <h5 className="text-2xl font-bold text-gray-900 dark:text-white pb-2">
                      Month Tracked: {lastMonthLabel}
                    </h5>
                  )}
                  <h5 className="text-2xl font-bold text-gray-900 dark:text-white pb-2">
                    Total Orders: {totalOrders}
                  </h5>
                  <h5 className="text-2xl font-bold text-gray-900 dark:text-white pb-2">
                    Total Revenue: P{totalRevenue.toFixed(2)}
                  </h5>
                  <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Overview of orders and revenue. <br />
                    Use the date selectors below to determine the total revenue and
                    orders from your given date range.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:mb-4 mt-4">
                <div className="flex-1">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 mt-1 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 mt-1 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
              <div className="flex flex-col">
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white pb-4">
                  Most Ordered Products
                </h5>
                {mostOrderedProducts.length > 0 ? (
                  <div className="overflow-y-auto max-h-80">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {mostOrderedProducts.map((product, index) => (
                        <li key={index} className="flex items-center space-x-4 py-4">
                          <img
                            src={product.prod_img}
                            alt={product.product_name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.product_name}
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Total Orders: {product.total_quantity}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No data available.
                  </p>
                )}
              </div>
            </div>

            {/* Best Selling Product Card */}
            <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
              <div>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white pb-4">
                  Best Selling
                </h5>
                {mostOrderedProduct.length > 0 ? (
                  <div className="overflow-y-auto max-h-80">
                    <ul>
                      {mostOrderedProduct.map((product, index) => (
                        <li key={index} className="flex flex-col items-center py-4">
                          <img
                            src={product.prod_img}
                            alt={product.product_name}
                            className="w-50 h-50 rounded object-cover mb-2"
                          />
                          <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.product_name}
                          </h6>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Orders: {product.total_quantity}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No data available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 dark:border-gray-700 mt-4">
        <CompletedOrders />
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
