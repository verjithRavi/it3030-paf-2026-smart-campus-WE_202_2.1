import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createResource, updateResource, getResourceById } from '../api/resourceApi';
import Spinner from '../components/ui/Spinner';

const RESOURCE_TYPES = [
  { value: 'LAB', label: 'Lab' },
  { value: 'ROOM', label: 'Room' },
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'EQUIPMENT', label: 'Equipment' }
];

const DEPARTMENTS = [
  'Faculty of Computing',
  'Faculty of Business',
  'Faculty of Engineering',
  'Faculty of Humanities & Sciences',
  'Faculty of Architecture',
  'Faculty of Hospitality & Culinary'
];

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

function CreateResourcePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const createType = searchParams.get('type');
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: createType === 'equipment' ? 'EQUIPMENT' : createType === 'place' ? 'LAB' : 'LAB',
    location: '',
    capacity: '',
    specifications: '',
    department: '',
    imageUrl: '',
    brand: '',
    model: '',
    serialNumber: '',
    floorNumber: '',
    buildingName: '',
    equipmentCategory: '',
    hasProjector: false,
    hasComputers: false,
    hasWhiteboard: false,
    hasWifi: false
  });

  useEffect(() => {
    if (editId) {
      loadResource();
    }
  }, [editId]);

  const loadResource = async () => {
    try {
      const resource = await getResourceById(editId);
      setFormData({
        name: resource.name || '',
        description: resource.description || '',
        type: resource.type || 'LAB',
        location: resource.location || '',
        capacity: resource.capacity || '',
        specifications: resource.specifications || '',
        department: resource.department || '',
        imageUrl: resource.imageUrl || '',
        brand: resource.brand || '',
        model: resource.model || '',
        serialNumber: resource.serialNumber || '',
        floorNumber: resource.floorNumber || '',
        buildingName: resource.buildingName || '',
        equipmentCategory: resource.equipmentCategory || '',
        hasProjector: resource.hasProjector || false,
        hasComputers: resource.hasComputers || false,
        hasWhiteboard: resource.hasWhiteboard || false,
        hasWifi: resource.hasWifi || false
      });
    } catch (error) {
      console.error('Failed to load resource:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null
      };

      if (editId) {
        await updateResource(editId, data);
      } else {
        await createResource(data);
      }

      navigate('/admin/resources');
    } catch (error) {
      console.error('Failed to save resource:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const isEquipment = formData.type === 'EQUIPMENT';
  const isRoomOrLab = formData.type === 'ROOM' || formData.type === 'LAB' || formData.type === 'LECTURE_HALL';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {editId ? 'Edit Resource' : createType === 'equipment' ? 'Create New Equipment' : 'Create New Place'}
        </h1>
        <p className="text-gray-600">
          {editId ? 'Update resource information' : createType === 'equipment' ? 'Add a new campus equipment' : 'Add a new campus place (Lab, Room, or Lecture Hall)'}
        </p>
      </div>

      {/* Type Selection Tabs - Only show for create mode */}
      {!editId && (
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, type: 'LAB' }));
                navigate('/admin/resources/create?type=place');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                !isEquipment ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Place
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, type: 'EQUIPMENT' }));
                navigate('/admin/resources/create?type=equipment');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                isEquipment ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Equipment
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {!isEquipment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="LAB">Lab</option>
                  <option value="ROOM">Room</option>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                </select>
              </div>
            )}

            {isEquipment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Type
                </label>
                <input
                  type="text"
                  value="Equipment"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., Building A, Floor 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                placeholder={isEquipment ? "Quantity" : "Number of persons"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Equipment Specific Fields */}
            {isEquipment && (
              <>
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Category *
                  </label>
                  <select
                    name="equipmentCategory"
                    value={formData.equipmentCategory}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {EQUIPMENT_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Room/Lab Specific Fields */}
            {isRoomOrLab && (
              <>
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Room Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Building Name
                  </label>
                  <select
                    name="buildingName"
                    value={formData.buildingName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Building</option>
                    {BUILDINGS.map(building => (
                      <option key={building} value={building}>{building}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    name="floorNumber"
                    value={formData.floorNumber}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'hasProjector', label: 'Projector' },
                      { name: 'hasComputers', label: 'Computers' },
                      { name: 'hasWhiteboard', label: 'Whiteboard' },
                      { name: 'hasWifi', label: 'WiFi' }
                    ].map(amenity => (
                      <label key={amenity.name} className="flex items-center">
                        <input
                          type="checkbox"
                          name={amenity.name}
                          checked={formData[amenity.name]}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{amenity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="md:col-span-2 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications
              </label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional specifications or features..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/resources')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size="sm" /> : (editId ? 'Update Resource' : 'Create Resource')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateResourcePage;
