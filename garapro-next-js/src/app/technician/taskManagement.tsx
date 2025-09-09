"use client";

import { FaClipboardList } from "react-icons/fa";

export default function TaskManagement() {
  // Sample task data (can be passed as props or fetched from an API in a real application)
  const currentTasks = [
    { id: 1, vehicle: "Toyota Camry 2020", issue: "Engine Check", time: "19/01/2025", status:"New",progress:"0%"},
    { id: 2, vehicle: "Honda Civic 2019", issue: "Brake Inspection", time: "19/01/2025",status:"New",progress:"0%"  },
    { id: 3, vehicle: "Ford F-150 2021", issue: "Oil Change", time: "19/01/2025", status:"In-progress",progress:"20%" },
  ];

  // Function to get status color
  const getStatusColor = (status:string) => {
    switch(status.toLowerCase()) {
      case 'new':
        return 'bg-yellow-200 text-yellow-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-[url('/images/image5.jpg')] bg-cover bg-no-repeat h-[640px] p-6 rounded-lg shadow-md relative before:absolute before:inset-0 before:bg-black before:opacity-50 before:rounded-lg">
  <div className="p-6 relative z-10">
    <div className="relative inline-block mb-6">
          <div className="absolute inset-0 w-full max-w-md bg-gray-300 shadow-md rounded-lg clip-diagonal"></div>
          <div className="relative flex items-center gap-2 px-6 py-3">
            <h2 className="text-[29px] font-bold flex items-center text-gray-800 text-center italic font-serif">
               <FaClipboardList className="mr-3 text-gray-600" />
                Task Management
            </h2>
          </div>
        </div>
  <div className="space-y-4 relative z-10">
    {currentTasks.map((task) => (
    <div key={task.id} className="border border-white/30 rounded-lg p-4 bg-white/20 shadow-lg">
  <div className="flex justify-between items-start mb-3">
    <div>
      <h3 className="font-semibold text-lg text-black italic font-serif">{task.vehicle}</h3>
      <p className="text-gray-900">{task.issue}</p>
    </div>
    <div className="flex flex-col items-end space-y-1 flex-shrink-0">
       <div className="flex items-center space-x-2 whitespace-nowrap">
         <span className="font-bold italic">Delivery deadline:</span>
         <span className="px-3 py-1 text-sm rounded bg-red-100 text-red-800">
           {task.time}
         </span>
       </div>
       <div className="flex items-center space-x-2 whitespace-nowrap">
         <span className={`px-3 py-1 text-sm rounded font-semibold ${getStatusColor(task.status)}`}>
           {task.status} : {task.progress}
         </span>
       </div>
    </div>
  </div>
  <div className="flex space-x-2">
  <button className="px-4 py-2 bg-gradient-to-r from-blue-400 to-teal-400 text-white font-bold rounded hover:from-blue-600 hover:to-teal-600 transition duration-300">
    Start Work
  </button>
  <button className="px-4 py-2 bg-gradient-to-r from-gray-400 to-teal-50 text-gray-700 font-bold rounded hover:from-gray-600 hover:to-teal-100 transition duration-300">
    View Details
  </button>
</div>
</div>
    ))}
  </div>
</div>
</div>
  );
}