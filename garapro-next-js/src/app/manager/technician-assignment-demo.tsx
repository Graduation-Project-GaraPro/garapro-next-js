"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTechnicianAssignmentNotifications } from "@/hooks/manager/useTechnicianAssignmentNotifications";

export default function TechnicianAssignmentDemo() {
  const [technicianId, setTechnicianId] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [jobCount, setJobCount] = useState(1);
  const [jobNames, setJobNames] = useState("");
  const [jobId, setJobId] = useState("");
  const [oldTechnicianId, setOldTechnicianId] = useState("");
  const [newTechnicianId, setNewTechnicianId] = useState("");
  const [jobName, setJobName] = useState("");
  const [inspectionCount, setInspectionCount] = useState(1);
  const [inspectionNames, setInspectionNames] = useState("");
  const [inspectionId, setInspectionId] = useState("");
  const [inspectionName, setInspectionName] = useState("");

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useTechnicianAssignmentNotifications();

  // Simulate sending a job assigned notification
  const simulateJobAssigned = () => {
    if (technicianId && technicianName && jobNames) {
      // In a real app, this would come from the SignalR hub
      const event = new CustomEvent('technicianAssignment', {
        detail: {
          type: 'jobAssigned',
          technicianId,
          technicianName,
          jobCount,
          jobNames: jobNames.split(',').map(name => name.trim())
        }
      });
      window.dispatchEvent(event);
    }
  };

  // Simulate sending a job reassigned notification
  const simulateJobReassigned = () => {
    if (jobId && oldTechnicianId && newTechnicianId && jobName) {
      // In a real app, this would come from the SignalR hub
      const event = new CustomEvent('technicianAssignment', {
        detail: {
          type: 'jobReassigned',
          jobId,
          oldTechnicianId,
          newTechnicianId,
          jobName
        }
      });
      window.dispatchEvent(event);
    }
  };

  // Simulate sending an inspection assigned notification
  const simulateInspectionAssigned = () => {
    if (technicianId && technicianName && inspectionNames) {
      // In a real app, this would come from the SignalR hub
      const event = new CustomEvent('technicianAssignment', {
        detail: {
          type: 'inspectionAssigned',
          technicianId,
          technicianName,
          inspectionCount,
          inspectionNames: inspectionNames.split(',').map(name => name.trim())
        }
      });
      window.dispatchEvent(event);
    }
  };

  // Simulate sending an inspection reassigned notification
  const simulateInspectionReassigned = () => {
    if (inspectionId && oldTechnicianId && newTechnicianId && inspectionName) {
      // In a real app, this would come from the SignalR hub
      const event = new CustomEvent('technicianAssignment', {
        detail: {
          type: 'inspectionReassigned',
          inspectionId,
          oldTechnicianId,
          newTechnicianId,
          inspectionName
        }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Technician Assignment Notification Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Job Assignment</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="technicianId">Technician ID</Label>
                  <Input
                    id="technicianId"
                    value={technicianId}
                    onChange={(e) => setTechnicianId(e.target.value)}
                    placeholder="Enter technician ID"
                  />
                </div>
                <div>
                  <Label htmlFor="technicianName">Technician Name</Label>
                  <Input
                    id="technicianName"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder="Enter technician name"
                  />
                </div>
                <div>
                  <Label htmlFor="jobCount">Job Count</Label>
                  <Input
                    id="jobCount"
                    type="number"
                    value={jobCount}
                    onChange={(e) => setJobCount(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="jobNames">Job Names (comma separated)</Label>
                  <Input
                    id="jobNames"
                    value={jobNames}
                    onChange={(e) => setJobNames(e.target.value)}
                    placeholder="Enter job names"
                  />
                </div>
                <Button onClick={simulateJobAssigned}>Simulate Job Assigned</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Job Reassignment</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobId">Job ID</Label>
                  <Input
                    id="jobId"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    placeholder="Enter job ID"
                  />
                </div>
                <div>
                  <Label htmlFor="oldTechnicianId">Old Technician ID</Label>
                  <Input
                    id="oldTechnicianId"
                    value={oldTechnicianId}
                    onChange={(e) => setOldTechnicianId(e.target.value)}
                    placeholder="Enter old technician ID"
                  />
                </div>
                <div>
                  <Label htmlFor="newTechnicianId">New Technician ID</Label>
                  <Input
                    id="newTechnicianId"
                    value={newTechnicianId}
                    onChange={(e) => setNewTechnicianId(e.target.value)}
                    placeholder="Enter new technician ID"
                  />
                </div>
                <div>
                  <Label htmlFor="jobName">Job Name</Label>
                  <Input
                    id="jobName"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="Enter job name"
                  />
                </div>
                <Button onClick={simulateJobReassigned}>Simulate Job Reassigned</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Inspection Assignment</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inspectionTechnicianId">Technician ID</Label>
                  <Input
                    id="inspectionTechnicianId"
                    value={technicianId}
                    onChange={(e) => setTechnicianId(e.target.value)}
                    placeholder="Enter technician ID"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectionTechnicianName">Technician Name</Label>
                  <Input
                    id="inspectionTechnicianName"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder="Enter technician name"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectionCount">Inspection Count</Label>
                  <Input
                    id="inspectionCount"
                    type="number"
                    value={inspectionCount}
                    onChange={(e) => setInspectionCount(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectionNames">Inspection Names (comma separated)</Label>
                  <Input
                    id="inspectionNames"
                    value={inspectionNames}
                    onChange={(e) => setInspectionNames(e.target.value)}
                    placeholder="Enter inspection names"
                  />
                </div>
                <Button onClick={simulateInspectionAssigned}>Simulate Inspection Assigned</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Inspection Reassignment</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inspectionId">Inspection ID</Label>
                  <Input
                    id="inspectionId"
                    value={inspectionId}
                    onChange={(e) => setInspectionId(e.target.value)}
                    placeholder="Enter inspection ID"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectionOldTechnicianId">Old Technician ID</Label>
                  <Input
                    id="inspectionOldTechnicianId"
                    value={oldTechnicianId}
                    onChange={(e) => setOldTechnicianId(e.target.value)}
                    placeholder="Enter old technician ID"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectionNewTechnicianId">New Technician ID</Label>
                  <Input
                    id="inspectionNewTechnicianId"
                    value={newTechnicianId}
                    onChange={(e) => setNewTechnicianId(e.target.value)}
                    placeholder="Enter new technician ID"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectionName">Inspection Name</Label>
                  <Input
                    id="inspectionName"
                    value={inspectionName}
                    onChange={(e) => setInspectionName(e.target.value)}
                    placeholder="Enter inspection name"
                  />
                </div>
                <Button onClick={simulateInspectionReassigned}>Simulate Inspection Reassigned</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Notifications</CardTitle>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No notifications yet. Use the forms above to simulate notifications.
              </p>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg border ${
                    !notification.read 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeNotification(notification.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}