"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaBox,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartBar,
  FaStar,
  FaSpinner
} from "react-icons/fa";
import { getMyStatistics, TechnicianStatistic } from "@/services/technician/statisticalService";

export default function StatisticalPage() {
  const router = useRouter();
  const [statistics, setStatistics] = useState<TechnicianStatistic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Token sẽ được lấy tự động trong service
      const data = await getMyStatistics();
      setStatistics(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thống kê';
      setError(errorMessage);
      
      // Nếu lỗi authentication, redirect về login
      if (errorMessage.includes("authentication") || errorMessage.includes("token")) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'border-blue-500';
      case 'inprogress': return 'border-yellow-500';
      case 'completed': return 'border-green-500';
      case 'onhold': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">New</span>;
      case 'inprogress': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">In Progress</span>;
      case 'completed': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>;
      case 'onhold': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">On Hold</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchStatistics}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) return null;

  return (
    <div className="flex-col h-full p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl rounded-xl">
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
                <p className="text-sm text-gray-600">New Tasks</p>
                <p className="text-3xl font-bold text-blue-600">{statistics.newJobs}</p>
              </div>
              <FaClipboardList className="text-3xl text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Pending assignment
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{statistics.inProgressJobs}</p>
              </div>
              <FaBox className="text-3xl text-yellow-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                Active work
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{statistics.completedJobs}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Finished tasks
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Hold</p>
                <p className="text-3xl font-bold text-red-600">{statistics.onHoldJobs}</p>
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
              {statistics.recentJobs.length > 0 ? (
                statistics.recentJobs.map((job, index) => (
                  <div key={index} className={`border-l-4 ${getStatusColor(job.status)} pl-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{job.jobName}</h4>
                        <p className="text-sm text-gray-600">Vehicle: {job.licensePlate}</p>
                        <p className="text-xs text-gray-500">{formatDate(job.assignedAt)}</p>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent tasks</p>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={() => router.push(`/technician/taskManagement/`)}
              >
                View all tasks →
              </button>
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-1 flex items-center text-gray-700">
              <FaStar className="mr-2 text-yellow-500" />
              Performance Score
            </h3>
            
            {/* Main Score Display */}
            <div className="text-center mb-1">
              <div className="relative inline-block">
                <div className="text-6xl font-bold text-gray-800 mb-2">
                  {statistics.score.toFixed(1)}
                </div>
                <div className="absolute -top-2 -right-2">
                  <FaStar className="text-yellow-500 text-2xl" />
                </div>
              </div>
              <div className="text-sm text-gray-600">out of 10</div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-3 mb-1">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500" 
                  style={{width: `${(statistics.score / 10) * 100}%`}}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {statistics.score >= 8 ? 'Excellent Performance' : 
                 statistics.score >= 6 ? 'Good Performance' : 
                 statistics.score >= 4 ? 'Average Performance' : 
                 'Needs Improvement'}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quality</span>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[1,2,3,4,5].map((star) => (
                      <FaStar 
                        key={star} 
                        className={`w-3 h-3 ${star <= Math.round(statistics.quality) ? 'text-yellow-500' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{statistics.quality.toFixed(1)}/10</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Speed</span>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[1,2,3,4,5].map((star) => (
                      <FaStar 
                        key={star} 
                        className={`w-3 h-3 ${star <= Math.round(statistics.speed) ? 'text-yellow-500' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{statistics.speed.toFixed(1)}/10</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Efficiency</span>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[1,2,3,4,5].map((star) => (
                      <FaStar 
                        key={star} 
                        className={`w-3 h-3 ${star <= Math.round(statistics.efficiency) ? 'text-yellow-500' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{statistics.efficiency.toFixed(1)}/10</span>
                </div>
              </div>
            </div>

            {/* Achievement Badge */}
            {statistics.score >= 8 && (
              <div className="mt-6 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-center">
                  <FaStar className="text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">Top Performer This Week!</span>
                  <FaStar className="text-yellow-500 ml-2" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}