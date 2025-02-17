import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { authenticatedApi } from '../interceptors/auth-interceptor';

interface VendorData {
    vendor_name: string;
    vendor_email: string;
    password: string;
    contact_number: string;
    location: string;
    description: string;
    operating_hours?: string;
    business_permit?: string;
}

interface LoginData {
    vendor_email: string;
    password: string;
}

interface OrderUpdateData {
    order_id: string;
    order_status: string;
}

interface IssueUpdateData {
    report_id: string;
    status: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface SalesData {
    week?: number;
    month?: number;
    year: number;
    total_sales: string;
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

interface WeeklySalesResponse extends ApiResponse<SalesData[]> { }
interface MonthlySalesResponse extends ApiResponse<SalesData[]> { }
interface OrdersRevenueResponse extends ApiResponse<OrdersAndRevenue> { }
interface ProductsResponse extends ApiResponse<Product[]> { }
interface SingleProductResponse extends ApiResponse<Product> { }

class ApiService {
    private api: AxiosInstance;
    private apiUrl: string = 'http://localhost:5000/api';

    constructor() {
        this.api = authenticatedApi;

        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    async register(vendorData: VendorData): Promise<AxiosResponse> {
        try {
            return await this.api.post('/vendors/auth/register', vendorData);
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(vendor_email: string, password: string): Promise<AxiosResponse> {
        try {
            return await this.api.post('/vendors/auth/login', { vendor_email, password });
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    loginWithGoogle(): void {
        window.location.href = `${this.apiUrl}/vendors/auth/google`;
    }

    async getProfile(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/vendors/information');
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    async updateVendorProfile(profileData: any): Promise<AxiosResponse> {
        try {
            return await this.api.put('/vendors/auth/profile', profileData);
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }

    async updateVendorInformation(vendorData: any): Promise<AxiosResponse> {
        try {
            return await this.api.patch('/vendors/information/patch', vendorData);
        } catch (error) {
            console.error('Error updating vendor information:', error);
            throw error;
        }
    }

    async updateVendorProfileImage(imageFile: File): Promise<AxiosResponse> {
        const formData = new FormData();
        formData.append('vendor_profile_image', imageFile, imageFile.name);
        try {
            return await this.api.post('/vendor/profiles/update', formData);
        } catch (error) {
            console.error('Error updating vendor profile image:', error);
            throw error;
        }
    }

    async getReviews(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/vendors/reviews');
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }

    async getOrders(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/orders');
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    async getCompletedOrders(page: number = 1, perPage: number = 10): Promise<AxiosResponse> {
        try {
            return await this.api.get('/orders/completed', {
                params: { page: page.toString(), per_page: perPage.toString() }
            });
        } catch (error) {
            console.error('Error fetching completed orders:', error);
            throw error;
        }
    }

    async updateOrder(orderData: OrderUpdateData): Promise<AxiosResponse> {
        try {
            return await this.api.post('/orders/update', orderData);
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    async getProducts(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/products');
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async getProductById(productId: string): Promise<AxiosResponse> {
        try {
            return await this.api.get(`/products/${productId}`);
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    async postProduct(productData: any, prodImg: File | null): Promise<AxiosResponse> {
        const formData = new FormData();
        formData.append('category', productData.category);
        formData.append('product_name', productData.product_name);
        formData.append('price', productData.price.toString());
        formData.append('description', productData.description);
        formData.append('quantity', productData.quantity.toString());
        formData.append('availability', productData.availability.toString());
        formData.append('date', productData.date);

        if (productData.variations?.length > 0) {
            const variations = productData.variations.filter((v: any) =>
                v.variation_name && v.price !== undefined
            );
            if (variations.length > 0) {
                formData.append('variations', JSON.stringify(variations));
            }
        }

        if (prodImg) {
            formData.append('prod_img', prodImg);
        }

        try {
            return await this.api.post('/products/post', formData);
        } catch (error) {
            console.error('Error posting product:', error);
            throw error;
        }
    }

    async updateProduct(productData: any, prodImg: File | null): Promise<AxiosResponse> {
        if (prodImg) {
            const formData = new FormData();
            formData.append('product_id', productData.product_id);
            formData.append('category', productData.category);
            formData.append('product_name', productData.product_name);
            formData.append('price', productData.price.toString());
            formData.append('description', productData.description || '');
            formData.append('availability', productData.availability.toString());

            if (productData.quantity !== undefined) {
                formData.append('quantity', parseInt(productData.quantity.toString(), 10).toString());
            }

            formData.append('date', productData.date || new Date().toISOString().split('T')[0]);
            formData.append('prod_img', prodImg, prodImg.name);

            try {
                return await this.api.post('/products/update', formData);
            } catch (error) {
                console.error('Error updating product:', error);
                throw error;
            }
        }

        const payload = {
            product_id: productData.product_id,
            category: productData.category,
            product_name: productData.product_name,
            price: parseFloat(productData.price),
            description: productData.description || '',
            availability: typeof productData.availability === 'boolean'
                ? productData.availability
                : Boolean(parseInt(productData.availability)),
            quantity: productData.quantity !== undefined
                ? parseInt(productData.quantity.toString(), 10)
                : null,
            date: productData.date || new Date().toISOString().split('T')[0]
        };

        try {
            return await this.api.post('/products/update', payload);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(productId: number): Promise<AxiosResponse> {
        try {
            return await this.api.delete(`/products/delete/${productId}`);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    async deleteMultipleProducts(productIds: number[]): Promise<AxiosResponse> {
        try {
            return await this.api.delete('/products/delete', {
                params: { product_ids: productIds.join(',') }
            });
        } catch (error) {
            console.error('Error deleting multiple products:', error);
            throw error;
        }
    }

    async searchProducts(searchTerm: string, category: string | null): Promise<AxiosResponse> {
        try {
            return await this.api.get('/products/search', {
                params: { q: searchTerm, category: category || '' }
            });
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    async getIssues(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/orders/issues');
        } catch (error) {
            console.error('Error fetching issues:', error);
            throw error;
        }
    }

    async updateIssueStatus(issueData: IssueUpdateData): Promise<AxiosResponse> {
        try {
            return await this.api.patch('/orders/issues/reportstatus/patch', issueData);
        } catch (error) {
            console.error('Error updating issue status:', error);
            throw error;
        }
    }

    async getWeeklySales(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/analytics/weeklysales');
        } catch (error) {
            console.error('Error fetching weekly sales:', error);
            throw error;
        }
    }

    async getMonthlySales(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/analytics/monthlysales');
        } catch (error) {
            console.error('Error fetching monthly sales:', error);
            throw error;
        }
    }

    async getTotalOrdersAndRevenue(startDate: string, endDate: string): Promise<AxiosResponse> {
        try {
            return await this.api.get('/analytics/totalordersandrevenue', {
                params: { startDate, endDate }
            });
        } catch (error) {
            console.error('Error fetching total orders and revenue:', error);
            throw error;
        }
    }

    async getMostOrderedProducts(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/analytics/mostorderedproducts');
        } catch (error) {
            console.error('Error fetching most ordered products:', error);
            throw error;
        }
    }

    async getMostOrderedProduct(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/analytics/mostorderedproduct');
        } catch (error) {
            console.error('Error fetching most ordered product:', error);
            throw error;
        }
    }

    async getSalesReport(): Promise<AxiosResponse> {
        try {
            return await this.api.get('/analytics/salesreport');
        } catch (error) {
            console.error('Error fetching sales report:', error);
            throw error;
        }
    }
}

export const apiService = new ApiService();

export const useAuth = () => {
    return {
        register: (vendorData: VendorData) => apiService.register(vendorData),
        login: (vendor_email: string, password: string) => apiService.login(vendor_email, password),
        loginWithGoogle: apiService.loginWithGoogle.bind(apiService),
    };
};

export const useProfile = () => {
    return {
        getProfile: () => apiService.getProfile(),
        getReviews: () => apiService.getReviews(),
        updateProfile: (profileData: any) => apiService.updateVendorProfile(profileData),
        updateInformation: (vendorData: any) => apiService.updateVendorInformation(vendorData),
        updateProfileImage: (imageFile: File) => apiService.updateVendorProfileImage(imageFile),
    };
};

export const useProducts = () => {
    return {
        getProducts: () => apiService.getProducts(),
        getProductById: (productId: string) => apiService.getProductById(productId),
        postProduct: (productData: any, prodImg: File | null) => apiService.postProduct(productData, prodImg),
        updateProduct: (productData: any, prodImg: File | null) => apiService.updateProduct(productData, prodImg),
        deleteProduct: (productId: number) => apiService.deleteProduct(productId),
        deleteMultipleProducts: (productIds: number[]) => apiService.deleteMultipleProducts(productIds),
        searchProducts: (searchTerm: string, category: string | null) => apiService.searchProducts(searchTerm, category),
    };
};

export const useOrders = () => {
    return {
      getOrders: () => apiService.getOrders(),
      getCompletedOrders: (page?: number, perPage?: number) => apiService.getCompletedOrders(page, perPage),
      updateOrder: (orderData: OrderUpdateData) => apiService.updateOrder(orderData),
    };
  };

export const useIssues = () => {
    return {
        getIssues: () => apiService.getIssues(),
        updateIssueStatus: (issueData: IssueUpdateData) => apiService.updateIssueStatus(issueData),
    };
};

export const useAnalytics = () => {
    return {
        getWeeklySales: async (): Promise<WeeklySalesResponse> => {
            const response = await apiService.getWeeklySales();
            return {
                success: response.status === 200,
                data: response.data.data
            };
        },
        getMonthlySales: async (): Promise<MonthlySalesResponse> => {
            const response = await apiService.getMonthlySales();
            return {
                success: response.status === 200,
                data: response.data.data
            };
        },
        getTotalOrdersAndRevenue: async (
            startDate: string,
            endDate: string
        ): Promise<OrdersRevenueResponse> => {
            const response = await apiService.getTotalOrdersAndRevenue(startDate, endDate);
            return {
                success: response.status === 200,
                data: response.data.data
            };
        },
        getMostOrderedProducts: async (): Promise<ProductsResponse> => {
            const response = await apiService.getMostOrderedProducts();
            return {
                success: response.status === 200,
                data: response.data.data
            };
        },
        getMostOrderedProduct: async (): Promise<SingleProductResponse> => {
            const response = await apiService.getMostOrderedProduct();
            return {
                success: response.status === 200,
                data: response.data.data
            };
        }
    };
};