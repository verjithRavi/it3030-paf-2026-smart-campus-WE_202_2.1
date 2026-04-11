import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllResources, deleteResource, toggleResourceActive, updateResourceStatus } from '../api/resourceApi';
import Spinner from '../components/ui/Spinner';

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  OCCUPIED: 'bg-red-100 text-red-800',
  RESERVED: 'bg-blue-100 text-blue-800'
};

function ResourceManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('places');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await getAllResources();
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        loadResources();
      } catch (error) {
        console.error('Failed to delete resource:', error);
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleResourceActive(id);
      loadResources();
    } catch (error) {
      console.error('Failed to toggle resource status:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateResourceStatus(id, newStatus);
      loadResources();
    } catch (error) {
      console.error('Failed to update resource status:', error);
    }
  };

  const filteredResources = resources.filter(resource => {
    // Filter by tab
    const matchesTab = activeTab === 'places' 
      ? ['LAB', 'ROOM', 'LECTURE_HALL'].includes(resource.type)
      : activeTab === 'equipment' 
      ? resource.type === 'EQUIPMENT'
      : true;
    
    // Filter by search term
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Resource Management</h1>
            <p className="text-gray-600">Manage campus resources and equipment</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('places')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'places'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Places
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'equipment'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Equipment
          </button>
        </div>
      </div>

      {/* Admin Creation Buttons */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => navigate('/admin/resources/create?type=place')}
            className="px-6 py-2 rounded-md text-sm font-medium transition-colors bg-white text-blue-600 shadow-sm"
          >
            + Create Place
          </button>
          <button
            onClick={() => navigate('/admin/resources/create?type=equipment')}
            className="px-6 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"
          >
            + Create Equipment
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                      <div className="text-sm text-gray-500">{resource.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{resource.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{resource.location}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {resource.capacity ? `${resource.capacity} persons` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={resource.status}
                      onChange={(e) => handleStatusChange(resource.id, e.target.value)}
                      className={`text-sm font-medium rounded-full px-3 py-1 ${STATUS_COLORS[resource.status]}`}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="RESERVED">Reserved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(resource.id)}
                      className={`text-sm font-medium ${
                        resource.active
                          ? 'text-green-600 hover:text-green-900'
                          : 'text-red-600 hover:text-red-900'
                      }`}
                    >
                      {resource.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/resources/create?edit=${resource.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No resources found</div>
            <p className="text-gray-400 mt-2">Create your first resource to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceManagementPage;
