import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getResourceById } from '../api/resourceApi';
import Spinner from '../components/ui/Spinner';
import NotificationService from '../services/notificationService';

function ResourceBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resourceId = searchParams.get('resourceId');
  
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1
  });

  useEffect(() => {
    if (resourceId) {
      loadResource();
    }
  }, [resourceId]);

  const loadResource = async () => {
    try {
      const data = await getResourceById(resourceId);
      setResource(data);
    } catch (error) {
      console.error('Failed to load resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Call booking API with correct format
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resourceId,
          userId: localStorage.getItem('userId') || 'A0001',
          startDate: `${bookingData.date}T${bookingData.startTime}:00`,
          endDate: `${bookingData.date}T${bookingData.endTime}:00`,
          purpose: bookingData.purpose,
          attendees: bookingData.attendees,
          notes: bookingData.notes
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Show success notification
        NotificationService.showBookingSuccess(result);
        setBookingSuccess(true);
        
        // Navigate back to resources list after 2 seconds
        setTimeout(() => {
          navigate('/resources?booking=success');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create booking. Please try again.');
        NotificationService.showBookingError(errorData.message || 'Failed to create booking');
      }
      
    } catch (error) {
      console.error('Booking failed:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToResources = () => {
    navigate('/resources');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Resource not found</h2>
          <p className="text-gray-600 mb-4">The resource you're trying to book doesn't exist.</p>
          <button
            onClick={handleBackToResources}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  if (resource.status !== 'AVAILABLE') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Resource Not Available</h2>
          <p className="text-gray-600 mb-4">This resource is currently {resource.status.toLowerCase()} and cannot be booked.</p>
          <button
            onClick={handleBackToResources}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success Notification */}
      {bookingSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Booking Successful!</h3>
              <p className="text-sm text-green-700">Your resource booking has been confirmed. Redirecting to resources...</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleBackToResources}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          <span className="mr-2">«</span> Back to Resources
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Resource</h1>
        <p className="text-gray-600">Schedule a booking for {resource.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Details</h2>
            
            {resource.imageUrl && (
              <div className="mb-4">
                <img
                  src={resource.imageUrl}
                  alt={resource.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900">{resource.name}</h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{resource.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{resource.location}</span>
                </div>
                {resource.capacity && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="font-medium">{resource.capacity} persons</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {resource.status}
                  </span>
                </div>
              </div>

              {resource.specifications && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Specifications</h4>
                  <p className="text-sm text-gray-600">{resource.specifications}</p>
                </div>
              )}

              {/* Room/Lab amenities */}
              {(resource.hasProjector || resource.hasComputers || resource.hasWhiteboard || resource.hasWifi) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {resource.hasProjector && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Projector</span>
                    )}
                    {resource.hasComputers && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Computers</span>
                    )}
                    {resource.hasWhiteboard && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Whiteboard</span>
                    )}
                    {resource.hasWifi && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">WiFi</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Attendees *
                  </label>
                  <input
                    type="number"
                    name="attendees"
                    value={bookingData.attendees}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max={resource.capacity || 999}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {resource.capacity && (
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum capacity: {resource.capacity} persons
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={bookingData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={bookingData.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Booking *
                </label>
                <textarea
                  name="purpose"
                  value={bookingData.purpose}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe the purpose of this booking..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Booking Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>Bookings must be made at least 24 hours in advance</li>
                  <li>Maximum booking duration is 4 hours</li>
                  <li>Please clean up after use</li>
                  <li>Report any issues to administration</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleBackToResources}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceBookingPage;
