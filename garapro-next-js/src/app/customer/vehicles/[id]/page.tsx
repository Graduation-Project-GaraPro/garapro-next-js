"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  Wrench,
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useVehicles } from '@/hooks/customer/useVehicles';
import { useRepairs } from '@/hooks/customer/useRepairs';
import { validateTextField, validateNumberField, validateLicensePlateField } from '@/utils/validate/formValidation';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id;
  
  const { vehicles, loading, updateVehicle, deleteVehicle } = useVehicles();
  const { repairs } = useRepairs();

  const [vehicle, setVehicle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
    licensePlate: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Wait until vehicles are loaded
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;

    const foundVehicle = vehicles.find(v => v.id.toString() === vehicleId);
    if (foundVehicle) {
      setVehicle(foundVehicle);
      setEditForm({
        brand: foundVehicle.brand || '',
        model: foundVehicle.model || '',
        year: foundVehicle.year ? foundVehicle.year.toString() : '',
        color: foundVehicle.color || '',
        licensePlate: foundVehicle.licensePlate || ''
      });
    }
  }, [vehicleId, vehicles]);

  // Filter repair history for this vehicle
  const vehicleRepairs = repairs.filter(repair => 
    repair.licensePlate === vehicle?.licensePlate
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    const licensePlateValidation = validateLicensePlateField(editForm.licensePlate, {
      required: true,
      label: 'License Plate'
    });
    if (!licensePlateValidation.isValid) errors.licensePlate = licensePlateValidation.error;

    const brandValidation = validateTextField(editForm.brand, {
      required: true,
      minLength: 2,
      label: 'Brand'
    });
    if (!brandValidation.isValid) errors.brand = brandValidation.error;

    const modelValidation = validateTextField(editForm.model, {
      required: true,
      minLength: 1,
      label: 'Model'
    });
    if (!modelValidation.isValid) errors.model = modelValidation.error;

    const yearValidation = validateNumberField(editForm.year.toString(), {
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
      integer: true,
      label: 'Year'
    });
    if (!yearValidation.isValid) errors.year = yearValidation.error;

    const colorValidation = validateTextField(editForm.color, {
      required: true,
      label: 'Color'
    });
    if (!colorValidation.isValid) errors.color = colorValidation.error;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Handle update
  const handleUpdate = (e) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    if (vehicle) {
      updateVehicle(vehicle.id, {
        ...editForm,
        year: parseInt(editForm.year, 10)
      });
      setIsEditing(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (vehicle) {
      deleteVehicle(vehicle.id);
      router.push('/customer/vehicles');
    }
  };

  // Loading state
  if (loading || !vehicles) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle information...</p>
        </div>
      </div>
    );
  }

  // Vehicle not found
  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Vehicle not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/customer/vehicles" className="mr-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">{vehicle.brand} {vehicle.model}</h1>
        </div>

        <div className="flex space-x-2">
          {!isEditing && (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic information */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Edit Vehicle</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                <input
                  type="text"
                  value={editForm.licensePlate}
                  onChange={(e) => setEditForm({...editForm, licensePlate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={editForm.brand}
                  onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={editForm.model}
                  onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={editForm.year}
                  onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={editForm.color}
                  onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">License Plate</div>
                    <div className="font-medium">{vehicle.licensePlate}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Brand</div>
                  <div className="font-medium">{vehicle.brand}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Model</div>
                  <div className="font-medium">{vehicle.model}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Year</div>
                  <div className="font-medium">{vehicle.year}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Color</div>
                  <div className="font-medium">{vehicle.color}</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Repair History */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Repair History</h2>
            <Link 
              href={`/customer/vehicles/${vehicle.id}/history`}
              className="text-blue-500 text-sm hover:underline"
            >
              View All
            </Link>
          </div>

          {vehicleRepairs.length > 0 ? (
            <div className="space-y-4">
              {vehicleRepairs.slice(0, 5).map((repair) => (
                <div key={repair.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between">
                    <div className="font-medium">{repair.issue}</div>
                    <RepairStatusBadge status={repair.status} />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{repair.date}</div>
                  <div className="text-sm mt-2">{repair.description.substring(0, 100)}...</div>
                  <Link 
                    href={`/customer/repairs/${repair.id}`}
                    className="text-blue-500 text-sm mt-2 inline-block hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-2">No repair history available</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>
            <p className="mb-4">
              Are you sure you want to delete vehicle <strong>{vehicle.brand} {vehicle.model}</strong> 
              with license plate <strong>{vehicle.licensePlate}</strong>?
            </p>
            <p className="text-gray-500 mb-4 text-sm">This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Repair status badge component
function RepairStatusBadge({ status }) {
  let color = "";
  let text = "";
  let icon = null;

  switch(status) {
    case "completed":
      color = "bg-green-100 text-green-800";
      text = "Completed";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "in-progress":
      color = "bg-blue-100 text-blue-800";
      text = "In Progress";
      icon = <Wrench className="h-3 w-3 mr-1" />;
      break;
    case "pending":
      color = "bg-yellow-100 text-yellow-800";
      text = "Pending";
      icon = <Calendar className="h-3 w-3 mr-1" />;
      break;
    case "cancelled":
      color = "bg-red-100 text-red-800";
      text = "Cancelled";
      icon = <AlertTriangle className="h-3 w-3 mr-1" />;
      break;
    default:
      color = "bg-gray-100 text-gray-800";
      text = status;
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full flex items-center ${color}`}>
      {icon}
      {text}
    </span>
  );
}
