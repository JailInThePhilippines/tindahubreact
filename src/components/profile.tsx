import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { Camera, Mail, MapPin, Phone, Star, AlertTriangle, Calendar } from 'lucide-react';
import { useProfile } from '../services/api-service';
import Swal from 'sweetalert2'

interface Profile {
  vendor_name: string;
  vendor_email: string;
  description: string;
  rating: number;
  contact_number: string;
  location: string;
  operating_hours: string;
  business_permit: string;
  vendor_profile_image: string;
  date_registered: string;
}

interface Review {
  name: string;
  email: string;
  rating: number;
  comment: string;
  review_date: string;
}

interface EditForm extends Omit<Profile, 'rating' | 'business_permit' | 'vendor_profile_image' | 'date_registered'> { }

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const { getProfile, getReviews, updateInformation, updateProfileImage } = useProfile();

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      if (response.data.success) {
        setProfile(response.data.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await getReviews();
      if (response.data.success) {
        setReviews(response.data.data);
      } else {
        setErrorReviews(true);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setErrorReviews(true);
    } finally {
      setLoadingReviews(false);
    }
  };

  const openEditModal = () => {
    if (profile) {
      setEditForm({
        vendor_name: profile.vendor_name,
        vendor_email: profile.vendor_email,
        description: profile.description,
        contact_number: profile.contact_number,
        location: profile.location,
        operating_hours: profile.operating_hours
      });
      setIsEditModalOpen(true);
    }
  };

  const saveChanges = async () => {
    if (!editForm) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save these changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await updateInformation(editForm);
        if (response.data.success) {
          setProfile(prev => prev ? { ...prev, ...editForm } : null);
          setIsEditModalOpen(false);

          await Swal.fire({
            icon: 'success',
            title: 'Profile Updated',
            text: 'Your profile information has been updated successfully.'
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: response.data.message || 'Failed to update profile. Please try again.'
          });
        }
      } catch (err) {
        console.error('Error updating profile:', err);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating your profile.'
        });
      }
    }
  };

  const saveProfileImage = async () => {
    if (!selectedImageFile) {
      await Swal.fire({
        icon: 'error',
        title: 'No File Selected',
        text: 'Please select an image file to upload.'
      });
      return;
    }

    try {
      const response = await updateProfileImage(selectedImageFile);
      if (response.data.success) {
        setProfile(prev => prev ? {
          ...prev,
          vendor_profile_image: response.data.image_url
        } : null);
        setIsImageModalOpen(false);

        await Swal.fire({
          icon: 'success',
          title: 'Profile Image Updated',
          text: 'Your profile image has been updated successfully.'
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: response.data.message || 'Failed to update profile image.'
        });
      }
    } catch (err) {
      console.error('Error updating profile image:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating your profile image.'
      });
    }
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 rounded-lg mt-14">
          {profile && (
            <div className="bg-gray-50 shadow-md rounded-lg p-6 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Vendor Image */}
              <div className="bg-white shadow-md rounded-lg p-4 flex justify-center relative">
                <div className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden">
                  {profile.vendor_profile_image ? (
                    <img
                      src={profile.vendor_profile_image}
                      alt="Vendor Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <button
                  className="absolute top-4 right-4 text-gray-500 p-2"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <Camera className="h-6 w-6" />
                </button>
              </div>

              {/* Vendor Details */}
              <div className="bg-white shadow-md rounded-lg p-4 col-span-1 md:col-span-2 relative">
                <button
                  onClick={openEditModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                  <Camera className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {profile.vendor_name}
                </h1>
                <p className="text-gray-600">{profile.description}</p>

                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500 h-5 w-5" />
                    <span>{profile.rating} / 5.0</span>
                  </div>
                  <p className="text-gray-500 mt-2 flex items-center gap-2">
                    <Mail className="h-5 w-5" /> {profile.vendor_email}
                  </p>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Phone className="h-5 w-5" /> {profile.contact_number}
                  </p>
                  <p className="text-gray-500 flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> {profile.location}
                  </p>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> {profile.operating_hours}
                  </p>
                  {!profile.business_permit && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Business Permit Not Uploaded
                    </p>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-8 col-span-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
                {loadingReviews ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500" />
                  </div>
                ) : errorReviews ? (
                  <div className="text-center text-gray-600">
                    <p>Failed to load reviews. Please try again later.</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="grid gap-4">
                    {reviews.map((review, index) => (
                      <div key={index} className="bg-white shadow-md rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-bold text-gray-800">{review.name}</h3>
                            <p className="text-sm text-gray-500">{review.email}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-500 h-5 w-5" />
                            <span>{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                        <p className="text-gray-400 text-sm mt-4">
                          Reviewed on: {new Date(review.review_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-600">
                    <p>No reviews available.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {isEditModalOpen && editForm && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-0">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Shop Details</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  saveChanges();
                }}>
                  <div className="space-y-4">
                    {/* Shop Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                      <input
                        type="text"
                        value={editForm.vendor_name}
                        onChange={(e) => setEditForm({ ...editForm, vendor_name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={editForm.vendor_email}
                        onChange={(e) => setEditForm({ ...editForm, vendor_email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                      <input
                        type="text"
                        value={editForm.contact_number}
                        onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Operating Hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
                      <input
                        type="text"
                        value={editForm.operating_hours}
                        onChange={(e) => setEditForm({ ...editForm, operating_hours: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 bg-gray-300 rounded-md text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Image Modal */}
          {isImageModalOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-0">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Update Profile Image</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  saveProfileImage();
                }}>
                  <div className="flex justify-center mb-4">
                    <div className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {selectedImagePreview ? (
                        <img
                          src={selectedImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">No Image Selected</div>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileSelected}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 rounded-md text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      disabled={!selectedImageFile}
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;