import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllResources, getResourcesByType } from '../api/resourceApi';
import Spinner from '../components/ui/Spinner';

const BUILDINGS = [
  'Main Building',
  'New Building', 
  'Engineering Building',
  'Business Building'
];

const EQUIPMENT_CATEGORIES = [
  'IT',
  'Engineering',
  'Biological',
  'Business',
  'Sports'
];

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  OCCUPIED: 'bg-red-100 text-red-800',
  RESERVED: 'bg-blue-100 text-blue-800'
};

function ResourceListPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('places');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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

  const handleBookResource = (resourceId) => {
    navigate(`/resources/booking?resourceId=${resourceId}`);
  };

  const getFilteredResources = () => {
    let filtered = resources;

    // Filter by tab
    if (activeTab === 'places') {
      filtered = filtered.filter(r => ['LAB', 'ROOM', 'LECTURE_HALL'].includes(r.type));
    } else if (activeTab === 'equipment') {
      filtered = filtered.filter(r => r.type === 'EQUIPMENT');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by building/category
    if (selectedFilter !== 'all') {
      if (activeTab === 'places') {
        filtered = filtered.filter(r => r.buildingName === selectedFilter);
      } else {
        filtered = filtered.filter(r => {
          const category = getEquipmentCategory(r);
          return category === selectedFilter;
        });
      }
    }

    return filtered;
  };

  const getEquipmentCategory = (resource) => {
    // Use equipmentCategory field if available, otherwise fallback to detection
    if (resource.equipmentCategory) {
      return resource.equipmentCategory;
    }
    
    // Fallback detection logic
    if (resource.name.toLowerCase().includes('computer') || resource.name.toLowerCase().includes('laptop')) {
      return 'IT';
    } else if (resource.name.toLowerCase().includes('projector')) {
      return 'IT';
    } else if (resource.department?.toLowerCase().includes('engineering')) {
      return 'Engineering';
    } else if (resource.department?.toLowerCase().includes('business')) {
      return 'Business';
    } else if (resource.name.toLowerCase().includes('bio') || resource.department?.toLowerCase().includes('bio')) {
      return 'Biological';
    } else if (resource.name.toLowerCase().includes('sport') || resource.department?.toLowerCase().includes('sport')) {
      return 'Sports';
    }
    return 'Other';
  };

  const getFilterOptions = () => {
    if (activeTab === 'places') {
      return ['all', ...BUILDINGS];
    } else {
      return ['all', ...EQUIPMENT_CATEGORIES];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredResources = getFilteredResources();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Campus Resources</h1>
        <p className="text-gray-600">Browse and book available campus resources</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => {
              setActiveTab('places');
              setSelectedFilter('all');
            }}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'places'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Places
          </button>
          <button
            onClick={() => {
              setActiveTab('equipment');
              setSelectedFilter('all');
            }}
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

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All {activeTab === 'places' ? 'Buildings' : 'Categories'}</option>
            {getFilterOptions().slice(1).map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {resource.imageUrl && (
              <div className="h-48 bg-gray-200">
                <img
                  src={resource.imageUrl}
                  alt={resource.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[resource.status]}`}>
                  {resource.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
              
              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <span className="font-medium">Type:</span>
                  <span className="ml-2">{resource.type}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Location:</span>
                  <span className="ml-2">{resource.location}</span>
                </div>
                {resource.buildingName && (
                  <div className="flex items-center">
                    <span className="font-medium">Building:</span>
                    <span className="ml-2">{resource.buildingName}</span>
                  </div>
                )}
                {resource.capacity && (
                  <div className="flex items-center">
                    <span className="font-medium">Capacity:</span>
                    <span className="ml-2">{resource.capacity} {resource.type === 'EQUIPMENT' ? 'units' : 'persons'}</span>
                  </div>
                )}
                {resource.department && (
                  <div className="flex items-center">
                    <span className="font-medium">Department:</span>
                    <span className="ml-2">{resource.department}</span>
                  </div>
                )}
              </div>

              {resource.status === 'AVAILABLE' ? (
                <button
                  onClick={() => handleBookResource(resource.id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Resource
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed"
                >
                  Not Available
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No resources found</div>
          <p className="text-gray-400 mt-2">Try adjusting your filters or check back later</p>
        </div>
      )}
    </div>
  );
}

export default ResourceListPage;
