# Quotation Dual Workflow - Multiple Creation Methods

## Overview
The system now supports **TWO ways** to create quotations, giving managers maximum flexibility:

1. **Manual Creation** - Create quotations directly from scratch
2. **Convert from Inspection** - Automatically generate from completed inspections

## Workflow Options

### Option 1: Manual Quotation Creation

**Location**: Quotation Tab

**Steps**:
1. Navigate to Repair Order → Quotation Tab
2. Click "Create Quotation" button
3. Fill in quotation details:
   - Select services
   - Add parts
   - Set quantities and prices
   - Add notes
4. Save quotation
5. Status: `Pending`

**Use Cases**:
- Quick quotes for simple repairs
- Custom quotations not based on inspection
- Emergency repairs
- Walk-in customers

**API**: `POST /api/Quotations`

### Option 2: Convert from Inspection

**Location**: Inspections Tab

**Steps**:
1. Technician completes inspection
2. Inspection status → `Completed`
3. Manager sees "Convert to Quotation" button
4. Click button
5. Quotation automatically created with:
   - All services from inspection
   - All recommended parts
   - Pre-filled quantities
6. Status: `Pending`

**Use Cases**:
- Detailed inspections with findings
- Complex repairs requiring inspection
- Warranty work
- Scheduled maintenance

**API**: `POST /api/Inspection/convert-to-quotation`

## UI Features

### Quotation Tab
**Header**:
- Title: "Quotations"
- Subtitle: "Create quotations manually or convert from completed inspections"
- Buttons:
  - "Refresh" - Reload quotations list
  - "Create Quotation" - Manual creation

**Quotation List**:
- Status badges (Pending, Sent, Approved, Rejected, Expired)
- Total amount
- Creation date
- Action buttons:
  - "View" - See quotation details
  - "Send to Customer" (Pending only)
  - "Copy to Jobs" (Approved only)

### Inspections Tab
**For Completed Inspections**:
- "Convert to Quotation" button (green)
- Shows only if:
  - Inspection status is "Completed"
  - No quotation exists for this inspection yet
- After conversion:
  - Button replaced with "Quotation Created" badge
  - Badge indicates quotation already exists

## Status Flow (Same for Both Methods)

```
Pending → Sent → Approved/Rejected
           ↓
        Expired
```

### Status Actions

**Pending**:
- Manager can edit quotation
- Manager can send to customer
- Manager can delete quotation

**Sent**:
- Waiting for customer response
- Customer can approve/reject
- Can expire if no response

**Approved**:
- Manager can copy to jobs
- Cannot be edited
- Ready for work assignment

**Rejected**:
- Customer declined
- Can create new quotation
- Archive or delete

**Expired**:
- No customer response in time
- Can resend or create new
- Archive or delete

## Comparison

| Feature | Manual Creation | Convert from Inspection |
|---------|----------------|------------------------|
| **Speed** | Fast for simple quotes | Slower (requires inspection first) |
| **Detail** | Manager defines | Based on inspection findings |
| **Services** | Manually selected | Auto-populated from inspection |
| **Parts** | Manually added | Pre-selected from recommendations |
| **Use Case** | Quick quotes, walk-ins | Detailed repairs, complex work |
| **Accuracy** | Depends on manager | Based on technician findings |
| **Traceability** | Limited | Full inspection history |

## Best Practices

### When to Use Manual Creation
✅ Simple repairs with known scope
✅ Quick estimates for walk-in customers
✅ Emergency repairs
✅ Standard maintenance packages
✅ Customer requests quote before inspection

### When to Use Convert from Inspection
✅ Complex repairs requiring diagnosis
✅ Unknown issues needing investigation
✅ Warranty work requiring documentation
✅ Insurance claims
✅ Detailed customer concerns
✅ When technician expertise is needed

## Business Rules

### Manual Creation
- ✅ Can create multiple quotations per repair order
- ✅ Can create without inspection
- ✅ Manager has full control over content
- ✅ No automatic service/part population

### Convert from Inspection
- ✅ Can only convert completed inspections
- ✅ One quotation per inspection
- ✅ Cannot convert if quotation already exists
- ✅ Services and parts auto-populated
- ✅ Maintains link to inspection for traceability

### Both Methods
- ✅ Same status flow (Pending → Sent → Approved/Rejected)
- ✅ Same approval process
- ✅ Same job creation process
- ✅ Can have multiple quotations per repair order
- ✅ Customer sees all quotations for their repair order

## API Endpoints

### Manual Creation
```
POST /api/Quotations
Body: CreateQuotationDto
Response: QuotationDto
```

### Convert from Inspection
```
POST /api/Inspection/convert-to-quotation
Body: { inspectionId: "guid", note: "string (optional)" }
Response: QuotationDto
```

### Common Operations
```
GET /api/Quotations/repair-order/{id} - Get all quotations for RO
PUT /api/Quotations/{id}/status - Update status
POST /api/Quotations/{id}/copy-to-jobs - Create jobs
```

## UI Implementation

### Quotation Tab
```typescript
// Has both buttons
<Button onClick={() => setIsCreateFormOpen(true)}>
  Create Quotation
</Button>

// Shows CreateQuotationDialog for manual creation
<CreateQuotationDialog
  open={isCreateFormOpen}
  onOpenChange={setIsCreateFormOpen}
  onSubmit={handleQuotationCreated}
/>
```

### Inspections Tab
```typescript
// Shows convert button for completed inspections
{task.status === "completed" && !hasQuotation && (
  <Button onClick={() => handleConvertToQuotation(task.inspectionId)}>
    Convert to Quotation
  </Button>
)}

// Shows badge if quotation exists
{hasQuotation && (
  <Badge>Quotation Created</Badge>
)}
```

## Advantages of Dual Approach

### Flexibility
- Managers can choose the best method for each situation
- No forced workflow
- Adapts to different business scenarios

### Efficiency
- Quick quotes don't require full inspection
- Detailed work gets proper documentation
- Reduces unnecessary steps

### Customer Service
- Faster response for simple requests
- Thorough analysis for complex issues
- Better customer experience

### Traceability
- Inspection-based quotes have full history
- Manual quotes are clearly identified
- Easy to track origin of each quotation

## Migration Notes

If you previously had only one method:
- ✅ All existing functionality preserved
- ✅ No breaking changes
- ✅ Both methods work independently
- ✅ Can use both methods on same repair order
- ✅ UI clearly indicates creation method

## Testing Checklist

### Manual Creation
- [ ] Click "Create Quotation" button
- [ ] Fill in quotation details
- [ ] Save and verify creation
- [ ] Check status is "Pending"
- [ ] Verify appears in quotation list

### Convert from Inspection
- [ ] Complete an inspection
- [ ] See "Convert to Quotation" button
- [ ] Click and verify conversion
- [ ] Check button changes to badge
- [ ] Verify quotation in quotation tab

### Both Methods
- [ ] Create multiple quotations (both methods)
- [ ] Verify all show in list
- [ ] Test status changes
- [ ] Test send to customer
- [ ] Test copy to jobs
- [ ] Verify no conflicts between methods

## Summary

The dual workflow provides:
- ✅ **Flexibility** - Choose the right method for each situation
- ✅ **Efficiency** - Fast quotes when needed, detailed when required
- ✅ **Traceability** - Full history for inspection-based quotes
- ✅ **User Choice** - Managers decide the best approach
- ✅ **No Limitations** - Both methods fully functional

This approach gives your team the best of both worlds! 🎉
