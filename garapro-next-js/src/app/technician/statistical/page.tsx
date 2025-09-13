"use client";
import { useRouter } from "next/navigation";
import {
  FaClipboardList,
  FaBox,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartBar,
  FaStar
} from "react-icons/fa";

export default function StatisticalPage() {
  const router = useRouter(); 
  return (
    <div className="space-y-6 p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
      {/* Header */}
      <div className="relative inline-block mb-4">
            <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
              <div className="relative flex items-center gap-2 px-6 py-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <FaChartBar className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col items-start">
                 <h2 className="text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                   Statistical
                 </h2>
                   <p className="text-gray-700 italic">Where numbers reveal performance.</p>
                </div>
            </div>
            </div>
    <div className="space-y-4 px-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tasks</p>
              <p className="text-3xl font-bold text-blue-600">12</p>
            </div>
            <FaClipboardList className="text-3xl text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              +3 from yesterday
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-3xl font-bold text-green-600">8</p>
            </div>
            <FaCheckCircle className="text-3xl text-green-600" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Goal: 10 tasks
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Parts</p>
              <p className="text-3xl font-bold text-orange-600">3</p>
            </div>
            <FaBox className="text-3xl text-orange-600" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Awaiting delivery
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent Tasks</p>
              <p className="text-3xl font-bold text-red-600">2</p>
            </div>
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
              Requires attention
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
            <FaClipboardList className="mr-2 text-blue-600" />
            Recent Tasks
          </h3>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">Engine Oil Change</h4>
                  <p className="text-sm text-gray-600">Vehicle: Toyota Camry 2020</p>
                  <p className="text-xs text-gray-500">Started 2 hours ago</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">Brake Inspection</h4>
                  <p className="text-sm text-gray-600">Vehicle: Honda Civic 2019</p>
                  <p className="text-xs text-gray-500">Completed 1 hour ago</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Completed
                </span>
              </div>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">Transmission Repair</h4>
                  <p className="text-sm text-gray-600">Vehicle: Ford F-150 2021</p>
                  <p className="text-xs text-gray-500">Scheduled for today</p>
                </div>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Urgent
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => router.push(`taskManagement`)}>
              View all tasks →
            </button>
          </div>
        </div>

        {/* Score */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-1 flex items-center text-gray-700">
            <FaStar className="mr-2 text-yellow-500" />
            Performance Score
          </h3>
          
          {/* Main Score Display */}
          <div className="text-center mb-1">
            <div className="relative inline-block">
              <div className="text-6xl font-bold text-gray-800 mb-2">8.5</div>
              <div className="absolute -top-2 -right-2">
                <FaStar className="text-yellow-500 text-2xl" />
              </div>
            </div>
            <div className="text-sm text-gray-600">out of 10</div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3 mb-1">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full" style={{width: '85%'}}></div>
            </div>
            <div className="text-xs text-gray-500">Excellent Performance</div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quality</span>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[1,2,3,4,5].map((star) => (
                    <FaStar key={star} className={`w-3 h-3 ${star <= 4 ? 'text-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-800">4/5</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Speed</span>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[1,2,3,4,5].map((star) => (
                    <FaStar key={star} className={`w-3 h-3 ${star <= 5 ? 'text-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-800">5/5</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Efficiency</span>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[1,2,3,4,5].map((star) => (
                    <FaStar key={star} className={`w-3 h-3 ${star <= 4 ? 'text-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-800">4/5</span>
              </div>
            </div>
          </div>

          {/* Achievement Badge */}
          <div className="mt-6 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center">
              <FaStar className="text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-yellow-800">Top Performer This Week!</span>
              <FaStar className="text-yellow-500 ml-2" />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}