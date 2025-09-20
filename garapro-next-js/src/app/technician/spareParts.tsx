"use client";

import { useState } from "react";
import { FaBox } from "react-icons/fa";

export default function SparePartsSuggestion() {
  const [spareParts, setSpareParts] = useState("");

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
        <FaBox className="mr-3 text-gray-600" />
        Spare Parts Suggestion
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Required Parts</h3>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg text-gray-700"
            rows={8}
            value={spareParts}
            onChange={(e) => setSpareParts(e.target.value)}
            placeholder="List required spare parts with specifications..."
          />
          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Request Parts
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Parts Inventory</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded text-gray-600">
              <span>Brake Pads - Toyota</span>
              <span className="text-green-600 font-semibold">In Stock</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded text-gray-600">
              <span>Oil Filter - Honda</span>
              <span className="text-yellow-600 font-semibold">Low Stock</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded text-gray-600">
              <span>Air Filter - Ford</span>
              <span className="text-red-600 font-semibold">Out of Stock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}