// components/manager/quotation/ServiceSelectionDialog.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
// Using native checkbox instead of UI component
import { serviceCatalog, GarageServiceCatalogItem } from '@/services/service-catalog';
import { Part } from '@/types/service';
import { QuotationService, QuotationServicePart } from '@/types/quotation';

interface ServiceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServicesSelected: (services: QuotationService[]) => void;
  existingServices?: QuotationService[];
}

// Mock parts data - in a real app, this would come from an API
const mockParts: Record<string, Part[]> = {
  's1': [ // Oil Change service
    {
      id: 'p1',
      name: 'Synthetic Oil (5W-30)',
      description: '5 Quart Synthetic Motor Oil',
      sku: 'OIL-5W30-SYN',
      price: 35.00,
      cost: 25.00,
      quantityInStock: 50,
      minStockLevel: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'p2',
      name: 'Oil Filter',
      description: 'High-quality oil filter',
      sku: 'FILTER-OIL-123',
      price: 15.00,
      cost: 8.00,
      quantityInStock: 100,
      minStockLevel: 20,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  's2': [ // Brake Service
    {
      id: 'p3',
      name: 'Brake Pads (Front)',
      description: 'Premium brake pads for front wheels',
      sku: 'BRAKE-PADS-FRONT',
      price: 85.00,
      cost: 55.00,
      quantityInStock: 30,
      minStockLevel: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'p4',
      name: 'Brake Rotors',
      description: 'High-performance brake rotors',
      sku: 'BRAKE-ROTORS-PAIR',
      price: 120.00,
      cost: 80.00,
      quantityInStock: 20,
      minStockLevel: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  's3': [ // Tire Rotation
    {
      id: 'p5',
      name: 'Tire Balancing',
      description: 'Professional tire balancing service',
      sku: 'TIRE-BALANCE-SVC',
      price: 20.00,
      cost: 5.00,
      quantityInStock: 0,
      minStockLevel: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  's4': [ // Engine Diagnostics
    {
      id: 'p6',
      name: 'Diagnostic Scanner',
      description: 'Professional diagnostic scanning tool',
      sku: 'DIAG-SCANNER-PRO',
      price: 45.00,
      cost: 25.00,
      quantityInStock: 5,
      minStockLevel: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

export function ServiceSelectionDialog({
  open,
  onOpenChange,
  onServicesSelected,
  existingServices = []
}: ServiceSelectionDialogProps) {
  const [services, setServices] = useState<GarageServiceCatalogItem[]>([]);
  const [filteredServices, setFilteredServices] = useState<GarageServiceCatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Initialize with existing services
  useEffect(() => {
    if (open && existingServices.length > 0) {
      const ids = new Set(existingServices.map(s => s.serviceId));
      setSelectedServiceIds(ids);
    }
  }, [open, existingServices]);

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const serviceList = await serviceCatalog.list();
        setServices(serviceList);
        setFilteredServices(serviceList);
      } catch (error) {
        console.error('Failed to load services:', error);
        // Use fallback data
        const fallbackServices = [
          { id: 's1', name: 'Oil Change', description: 'Full synthetic oil change', basePrice: 45, duration: 30, category: 'Maintenance', isActive: true },
          { id: 's2', name: 'Brake Service', description: 'Brake pad replacement', basePrice: 120, duration: 90, category: 'Repair', isActive: true },
          { id: 's3', name: 'Tire Rotation', description: 'Rotation and balancing', basePrice: 35, duration: 45, category: 'Maintenance', isActive: true },
          { id: 's4', name: 'Engine Diagnostics', description: 'Engine diagnostics and scan', basePrice: 80, duration: 60, category: 'Diagnostics', isActive: true },
        ];
        setServices(fallbackServices);
        setFilteredServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadServices();
    }
  }, [open]);

  // Filter services based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [searchTerm, services]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selectedServices = filteredServices
      .filter(service => selectedServiceIds.has(service.id))
      .map(service => {
        // Check if this service already exists in the quotation
        const existing = existingServices.find(s => s.serviceId === service.id);
        
        // Get parts for this service
        const serviceParts = mockParts[service.id] || [];
        
        const quotationServiceParts: QuotationServicePart[] = serviceParts.map(part => ({
          id: `qtsp-${Date.now()}-${part.id}`,
          partId: part.id,
          partName: part.name,
          partDescription: part.description,
          partSku: part.sku,
          partPrice: part.price,
          quantity: 1,
          isSelected: existing 
            ? existing.quotationServiceParts.some(p => p.partId === part.id && p.isSelected)
            : true, // Default to selected for recommended parts
          isRecommended: true,
          recommendationNote: 'Recommended by technician',
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        return {
          id: existing?.id || `qts-${Date.now()}-${service.id}`,
          serviceId: service.id,
          serviceName: service.name,
          serviceDescription: service.description,
          price: service.basePrice,
          quantity: 1,
          isSelected: true,
          quotationServiceParts,
          createdAt: existing?.createdAt || new Date(),
          updatedAt: new Date()
        };
      });

    onServicesSelected(selectedServices);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset selection to existing services
    const ids = new Set(existingServices.map(s => s.serviceId));
    setSelectedServiceIds(ids);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Services</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center py-2">
          <Label htmlFor="search" className="mr-2">Search:</Label>
          <Input
            id="search"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-32">Category</TableHead>
                  <TableHead className="w-24 text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow 
                    key={service.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.has(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell className="text-right">${service.basePrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedServiceIds.size === 0}>
            Confirm Selection ({selectedServiceIds.size} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}