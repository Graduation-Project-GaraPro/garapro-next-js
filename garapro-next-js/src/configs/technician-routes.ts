// src/configs/technician-routes.ts

export interface RoutePermissionRule {
  pattern: RegExp;
  permissions: string[];
}

export const technicianRoutePermissionRules: RoutePermissionRule[] = [
  // ===== TECHNICIAN DASHBOARD / HOME =====
  {
    pattern: /^\/technician\/?$/,
    permissions: [
      "JOB_TECHNICIAN_VIEW",
      "INSPECTION_TECHNICIAN_VIEW",
      "REPAIR_VIEW",
    ],
  },

  // ===== MY TASK =====
  {
    pattern: /^\/technician\/taskManagement\/?$/,
    permissions: [
      "JOB_TECHNICIAN_VIEW",
      "JOB_TECHNICIAN_UPDATE",
      "INSPECTION_TECHNICIAN_VIEW",
      
    ],
  },

  // ===== INSPECTION & REPAIR =====

  // Vehicle Inspection
  {
    pattern: /^\/technician\/inspectionAndRepair\/inspection(\/.*)?$/,
    permissions: [
      "INSPECTION_TECHNICIAN_VIEW",
      "INSPECTION_TECHNICIAN_UPDATE",
      "INSPECTION_TECHNICIAN_DELETE",
      "INSPECTION_ADD_SERVICE",
    ],
  },
  

  // Repair Progress
  {
    pattern: /^\/technician\/inspectionAndRepair\/repair(\/.*)?$/,
    permissions: ["REPAIR_VIEW", "REPAIR_UPDATE", "REPAIR_CREATE"],
  },

  // ===== REPAIR HISTORY =====
  {
    pattern: /^\/technician\/repairHistory(\/.*)?$/,
    permissions: ["REPAIR_HISTORY_VIEW"],
  },

  // ===== VEHICLE / INFORMATION LOOKUP =====
  {
    pattern: /^\/technician\/vehicleLookup(\/.*)?$/,
    permissions: [
      "SPECIFICATION_MANAGE",
      "REPAIR_VIEW",
      "INSPECTION_TECHNICIAN_VIEW",
    ],
  },

  // ===== STATISTICAL =====
  {
    pattern: /^\/technician\/statistical(\/.*)?$/,
    permissions: ["STATISTICAL_VIEW"],
  },

  // ===== (OPTIONAL) NOTIFICATIONS TECHNICIAN =====
  // Nếu sau này có trang /technician/notifications
  {
    pattern: /^\/technician\/notifications(\/.*)?$/,
    permissions: ["NOTIFICATION_VIEW", "NOTIFICATION_MARK", "NOTIFICATION_DELETE"],
  },
];
