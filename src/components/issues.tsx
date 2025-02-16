import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { useIssues } from '../services/api-service';
import Swal from 'sweetalert2';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { Check } from 'lucide-react';

interface Issue {
  report_id: string;
  order_id: string;
  status: string;
  report_date: string;
  reporter_name: string;
  reporter_email: string;
  issue_type: string;
  additional_details: string;
  order_items: Array<{
    product_name: string;
    description: string;
    quantity: number;
    unit_price: number;
    prod_img: string;
  }>;
}

interface IssueUpdateData {
  report_id: string;
  status: string;
}

const Issues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getIssues, updateIssueStatus } = useIssues();

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const loadIssues = async () => {
    setIsLoading(true);
    try {
      const response = await getIssues();
      if (response.data.success) {
        setIssues(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const viewIssueDetails = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedIssue) return;

    try {
      await updateIssueStatus({
        report_id: selectedIssue.report_id,
        status: newStatus,
      });

      await Swal.fire(
        'Success',
        'Issue status updated successfully!',
        'success'
      );

      if (newStatus === 'resolved') {
        setIssues(issues.filter(issue => issue.report_id !== selectedIssue.report_id));
        setSelectedIssue(null);
      } else {
        loadIssues();
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
      Swal.fire('Error', 'Failed to update the issue status.', 'error');
    }
  };

  const mapStatus = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-red-600';
      case 'in_progress':
        return 'text-yellow-600';
      case 'resolved':
        return 'text-green-600';
      default:
        return '';
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 rounded-lg dark:border-gray-700 mt-14">
          {isLoading ? (
            <Box className="flex justify-center items-center h-64">
              <CircularProgress />
            </Box>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column: Table of issues */}
              <Paper className="bg-gray-50 p-6 rounded-lg shadow-lg">
                <Typography variant="h5" className="font-bold text-gray-800 mb-6">
                  Issues
                </Typography>
                <div className="overflow-x-auto">
                  {issues.length > 0 ? (
                    <table className="w-full border-collapse text-sm text-gray-600">
                      <thead>
                        <tr className="bg-gray-100 border-b">
                          <th className="px-6 py-4 text-left font-medium text-gray-800 uppercase">
                            Issue ID
                          </th>
                          <th className="px-6 py-4 text-left font-medium text-gray-800 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left font-medium text-gray-800 uppercase">
                            Report Date
                          </th>
                          <th className="px-6 py-4 text-left font-medium text-gray-800 uppercase">
                            View Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {issues.map((issue) => (
                          <tr
                            key={issue.report_id}
                            className={`border-b hover:bg-gray-100 ${
                              selectedIssue?.report_id === issue.report_id
                                ? 'bg-blue-100'
                                : ''
                            }`}
                          >
                            <td className="px-6 py-4">#UNMPEX{issue.order_id}</td>
                            <td className={`px-6 py-4 font-semibold ${getStatusColor(issue.status)}`}>
                              {mapStatus(issue.status)}
                            </td>
                            <td className="px-6 py-4">{issue.report_date}</td>
                            <td className="px-6 py-4">
                              <Button
                                onClick={() => viewIssueDetails(issue)}
                                variant="contained"
                                className="text-xs px-4 py-2"
                                size="small"
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-6 text-gray-600 font-medium">
                      No Issues Found
                    </div>
                  )}
                </div>
              </Paper>

              {/* Right column: Issue details */}
              {selectedIssue && (
                <Paper className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
                  <Typography variant="h5" className="font-bold text-gray-800 dark:text-gray-200 mb-6">
                    Issue Details
                  </Typography>

                  <div className="space-y-6">
                    {/* Issue Information */}
                    <div className="space-y-2">
                      <Typography className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Issue ID:</strong> #UNMPEX{selectedIssue.order_id}
                      </Typography>
                      <Typography className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Status:</strong>
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ml-2 ${
                            selectedIssue.status === 'pending'
                              ? 'bg-red-100 text-red-700'
                              : selectedIssue.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {mapStatus(selectedIssue.status)}
                        </span>
                      </Typography>
                      <Typography className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Report Date:</strong> {selectedIssue.report_date}
                      </Typography>
                    </div>

                    {/* Reporter Information */}
                    <Paper className="bg-gray-50 p-6 rounded-lg shadow-sm dark:bg-gray-700">
                      <Typography variant="h6" className="text-gray-800 dark:text-gray-200 mb-3">
                        Reporter Information
                      </Typography>
                      <Typography className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Name:</strong> {selectedIssue.reporter_name}
                      </Typography>
                      <Typography className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Email:</strong> {selectedIssue.reporter_email}
                      </Typography>
                    </Paper>

                    {/* Report */}
                    <Paper className="bg-gray-50 p-6 rounded-lg shadow-sm dark:bg-gray-700">
                      <Typography variant="h6" className="text-gray-800 dark:text-gray-200 mb-3">
                        Reports
                      </Typography>
                      <Typography className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Issue:</strong> {selectedIssue.issue_type}
                      </Typography>
                      <Typography className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Additional Details:</strong> {selectedIssue.additional_details}
                      </Typography>
                    </Paper>

                    {/* Products List */}
                    <div className="space-y-6">
                      <Typography variant="h6" className="text-gray-800 dark:text-gray-200 mb-3">
                        Products
                      </Typography>
                      <div className="space-y-4">
                        {selectedIssue.order_items.map((product, index) => (
                          <Paper
                            key={index}
                            className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg shadow-sm dark:bg-gray-700"
                          >
                            <img
                              src={product.prod_img}
                              alt={product.product_name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <Typography className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {product.product_name}
                              </Typography>
                              <Typography className="text-xs text-gray-500 dark:text-gray-400">
                                {product.description}
                              </Typography>
                              <Typography className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Quantity:</strong> {product.quantity}
                              </Typography>
                              <Typography className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Unit Price:</strong> {product.unit_price}
                              </Typography>
                            </div>
                          </Paper>
                        ))}
                      </div>
                    </div>

                    {/* Status Update Buttons */}
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <Typography className="text-sm text-gray-600 dark:text-gray-400 w-full sm:w-auto">
                        Issue Status:
                      </Typography>

                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                          <Button
                            key={status.value}
                            onClick={() => handleUpdateStatus(status.value)}
                            variant="outlined"
                            className={`px-4 py-2 rounded-full text-xs font-medium ${
                              selectedIssue.status === status.value
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {status.label}
                          </Button>
                        ))}
                      </div>

                    </div>
                  </div>
                </Paper>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Issues;