"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Car } from "lucide-react"; // icon đẹp từ lucide-react

// Fake current user
const fakeUser = { id: 1, name: "John Doe" };

// Fake data
const fakeBranches = [
  { id: "b1", name: "Downtown Branch" },
  { id: "b2", name: "Uptown Branch" },
];

const fakeVehicleModels = [
  { id: "m1", name: "Toyota Corolla" },
  { id: "m2", name: "Honda Civic" },
];

const fakeVehicleModelColors = [
  { id: "c1", modelId: "m1", name: "White" },
  { id: "c2", modelId: "m1", name: "Black" },
  { id: "c3", modelId: "m2", name: "Red" },
  { id: "c4", modelId: "m2", name: "Blue" },
];

export default function CreateVehiclePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    branchId: "",
    modelId: "",
    colorId: "",
    licensePlate: "",
    vin: "",
  });

  const [availableColors, setAvailableColors] = useState<any[]>([]);

  // Lọc màu theo ModelID
  useEffect(() => {
    if (form.modelId) {
      setAvailableColors(
        fakeVehicleModelColors.filter((color) => color.modelId === form.modelId)
      );
    } else {
      setAvailableColors([]);
    }
  }, [form.modelId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newVehicle = {
      ...form,
      customerId: fakeUser.id,
      createdAt: new Date().toISOString(),
    };

    console.log("New vehicle created:", newVehicle);
    alert("Vehicle created! Check console for data.");
    router.push("/customer/vehicles");
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create Vehicle</h1>
            <p className="text-sm text-gray-500">
              Add your vehicle details to manage and track services.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              name="branchId"
              value={form.branchId}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            >
              <option value="">Select Branch</option>
              {fakeBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Model
            </label>
            <select
              name="modelId"
              value={form.modelId}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            >
              <option value="">Select Model</option>
              {fakeVehicleModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <select
              name="colorId"
              value={form.colorId}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100"
              required
              disabled={!availableColors.length}
            >
              <option value="">Select Color</option>
              {availableColors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          {/* License Plate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Plate
            </label>
            <input
              type="text"
              name="licensePlate"
              value={form.licensePlate}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN
            </label>
            <input
              type="text"
              name="vin"
              value={form.vin}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow hover:opacity-90 transition"
          >
            Create Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}
