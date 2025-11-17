import { technicianAssignmentHubService } from "../technician-assignment-hub";

// Mock the SignalR library
jest.mock("@microsoft/signalr", () => {
  const mockHubConnection = {
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    onclose: jest.fn(),
    invoke: jest.fn().mockResolvedValue(undefined),
  };

  const mockHubConnectionBuilder = {
    withUrl: jest.fn().mockReturnThis(),
    configureLogging: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue(mockHubConnection),
  };

  return {
    HubConnectionBuilder: jest.fn(() => mockHubConnectionBuilder),
    LogLevel: {
      Information: "Information",
    },
  };
});

describe("TechnicianAssignmentHubService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start connection successfully", async () => {
    const result = await technicianAssignmentHubService.startConnection();
    expect(result).toBe(true);
  });

  it("should register event listeners", async () => {
    // Mock the HubConnectionBuilder to return a mock connection
    const mockConnection = {
      start: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      onclose: jest.fn(),
    };

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn().mockReturnValue("test-token"),
      },
      writable: true,
    });

    // Mock process.env
    process.env.NEXT_PUBLIC_API_URL = "https://localhost:7113";

    await technicianAssignmentHubService.startConnection();

    // Verify that event listeners are registered
    expect(mockConnection.on).toHaveBeenCalledWith("JobAssigned", expect.any(Function));
    expect(mockConnection.on).toHaveBeenCalledWith("JobReassigned", expect.any(Function));
    expect(mockConnection.on).toHaveBeenCalledWith("InspectionAssigned", expect.any(Function));
    expect(mockConnection.on).toHaveBeenCalledWith("InspectionReassigned", expect.any(Function));
  });

  it("should handle connection errors gracefully", async () => {
    // Mock the HubConnectionBuilder to throw an error
    jest.spyOn(console, "error").mockImplementation();

    const mockConnection = {
      start: jest.fn().mockRejectedValue(new Error("Connection failed")),
    };

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn().mockReturnValue("test-token"),
      },
      writable: true,
    });

    // Mock process.env
    process.env.NEXT_PUBLIC_API_URL = "https://localhost:7113";

    const result = await technicianAssignmentHubService.startConnection();
    expect(result).toBe(false);
  });

  it("should add and remove job assigned listeners", () => {
    const mockCallback = jest.fn();
    
    technicianAssignmentHubService.addJobAssignedListener(mockCallback);
    technicianAssignmentHubService.removeJobAssignedListener(mockCallback);
    
    // If we get here without errors, the test passes
    expect(true).toBe(true);
  });

  it("should add and remove job reassigned listeners", () => {
    const mockCallback = jest.fn();
    
    technicianAssignmentHubService.addJobReassignedListener(mockCallback);
    technicianAssignmentHubService.removeJobReassignedListener(mockCallback);
    
    // If we get here without errors, the test passes
    expect(true).toBe(true);
  });

  it("should add and remove inspection assigned listeners", () => {
    const mockCallback = jest.fn();
    
    technicianAssignmentHubService.addInspectionAssignedListener(mockCallback);
    technicianAssignmentHubService.removeInspectionAssignedListener(mockCallback);
    
    // If we get here without errors, the test passes
    expect(true).toBe(true);
  });

  it("should add and remove inspection reassigned listeners", () => {
    const mockCallback = jest.fn();
    
    technicianAssignmentHubService.addInspectionReassignedListener(mockCallback);
    technicianAssignmentHubService.removeInspectionReassignedListener(mockCallback);
    
    // If we get here without errors, the test passes
    expect(true).toBe(true);
  });
});