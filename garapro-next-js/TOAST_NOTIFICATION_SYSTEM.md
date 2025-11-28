# Toast Notification System

## Overview
Implemented a comprehensive toast notification system using Radix UI to provide immediate visual feedback for user actions throughout the manager interface.

## Components

### 1. Toast Component (`src/components/ui/toast.tsx`)
Base toast component built on `@radix-ui/react-toast` with three variants:
- **default**: White background for general notifications
- **success**: Green background for successful operations
- **destructive**: Red background for errors

### 2. Toaster Component (`src/components/ui/toaster.tsx`)
Container component that renders all active toasts. Positioned at:
- Top-right on desktop
- Bottom on mobile (responsive)

### 3. useToast Hook (`src/hooks/use-toast.ts`)
Custom React hook for managing toast state and displaying notifications.

## Installation

### Dependencies
```bash
npm install @radix-ui/react-toast
```

### Integration
Added `<Toaster />` component to the manager layout (`src/app/manager/layout.tsx`):
```tsx
import { Toaster } from "@/components/ui/toaster"

export default function ManagerLayout({ children }) {
  return (
    <div>
      {/* ... layout content ... */}
      <Toaster />
    </div>
  )
}
```

## Usage

### Basic Usage
```tsx
import { useToast } from "@/hooks/use-toast"

function MyComponent() {
  const { toast } = useToast()

  const handleAction = () => {
    toast({
      variant: "success",
      title: "Success!",
      description: "Your action was completed successfully.",
    })
  }
}
```

### Toast Variants

#### Success Toast (Green)
```tsx
toast({
  variant: "success",
  title: "Operation Successful",
  description: "Your changes have been saved.",
})
```

#### Error Toast (Red)
```tsx
toast({
  variant: "destructive",
  title: "Error Occurred",
  description: "Failed to complete the operation. Please try again.",
})
```

#### Default Toast (White)
```tsx
toast({
  variant: "default",
  title: "Information",
  description: "This is a general notification.",
})
```

## Implemented Toast Messages

### Jobs Tab (`jobs-tab.tsx`)

#### Technician Assignment - Single Job
```tsx
toast({
  variant: "success",
  title: "Technician Assigned",
  description: "The technician has been successfully assigned to the job.",
})
```

#### Technician Assignment - Batch
```tsx
toast({
  variant: "success",
  title: "Technician Assigned",
  description: `Successfully assigned technician to ${count} jobs.`,
})
```

#### Assignment Error
```tsx
toast({
  variant: "destructive",
  title: "Assignment Failed",
  description: errorMessage,
})
```

### Edit Job Dialog (`edit-job-dialog.tsx`)

#### Job Update Success
```tsx
toast({
  variant: "success",
  title: "Job Updated",
  description: "The job has been successfully updated.",
})
```

#### Job Update Error
```tsx
toast({
  variant: "destructive",
  title: "Update Failed",
  description: "Failed to update job. Please try again.",
})
```

### Edit Repair Order Dialog (`edit-repair-order-dialog.tsx`)

#### Repair Order Update Success
```tsx
toast({
  variant: "success",
  title: "Repair Order Updated",
  description: "The repair order has been successfully updated.",
})
```

#### Repair Order Update Error
```tsx
toast({
  variant: "destructive",
  title: "Update Failed",
  description: "Failed to update repair order. Please try again.",
})
```

## Toast Features

### Auto-Dismiss
- Toasts automatically dismiss after a timeout
- Default timeout: 1,000,000ms (configurable in `use-toast.ts`)

### Swipe to Dismiss
- Mobile users can swipe toasts to dismiss them
- Smooth animation on swipe

### Multiple Toasts
- System supports multiple toasts
- Limited to 1 toast at a time (configurable via `TOAST_LIMIT`)
- New toasts replace older ones

### Animations
- Slide-in animation when toast appears
- Fade-out animation when toast dismisses
- Smooth transitions for all state changes

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly

## Color Scheme

### Success (Green)
- Background: `bg-green-500`
- Border: `border-green-500`
- Text: `text-white`
- Use for: Successful operations, confirmations

### Destructive (Red)
- Background: `bg-red-500`
- Border: `border-red-500`
- Text: `text-white`
- Use for: Errors, failures, warnings

### Default (White)
- Background: `bg-white`
- Border: `border`
- Text: `text-gray-950`
- Use for: General information, neutral messages

## Best Practices

### When to Use Toasts

✅ **DO use toasts for:**
- Confirming successful actions (save, update, delete)
- Notifying about errors that don't block the UI
- Providing feedback for background operations
- Quick status updates

❌ **DON'T use toasts for:**
- Critical errors that require user action (use dialogs instead)
- Long messages (keep descriptions concise)
- Frequent updates (can be annoying)
- Information that needs to persist (use alerts or banners)

### Message Guidelines

1. **Keep titles short**: 2-4 words maximum
2. **Be specific in descriptions**: Tell users exactly what happened
3. **Use action-oriented language**: "Updated", "Assigned", "Failed"
4. **Include context when helpful**: "Successfully assigned technician to 5 jobs"

### Error Handling Pattern

```tsx
try {
  await someOperation()
  
  toast({
    variant: "success",
    title: "Success",
    description: "Operation completed successfully.",
  })
} catch (error) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : "An unexpected error occurred."
  
  toast({
    variant: "destructive",
    title: "Error",
    description: errorMessage,
  })
}
```

## Customization

### Changing Toast Duration
Edit `TOAST_REMOVE_DELAY` in `src/hooks/use-toast.ts`:
```tsx
const TOAST_REMOVE_DELAY = 5000 // 5 seconds
```

### Changing Toast Limit
Edit `TOAST_LIMIT` in `src/hooks/use-toast.ts`:
```tsx
const TOAST_LIMIT = 3 // Show up to 3 toasts at once
```

### Styling
Modify the `toastVariants` in `src/components/ui/toast.tsx` to customize colors and styles.

## Files Created/Modified

### Created
1. `src/components/ui/toast.tsx` - Base toast component
2. `src/components/ui/toaster.tsx` - Toast container
3. `src/hooks/use-toast.ts` - Toast management hook

### Modified
1. `src/app/manager/layout.tsx` - Added Toaster component
2. `src/app/manager/repairOrderManagement/orders/[id]/components/jobs-tab.tsx` - Added toast notifications
3. `src/app/manager/repairOrderManagement/orders/[id]/components/edit-job-dialog.tsx` - Added toast notifications
4. `src/app/manager/repairOrderManagement/orders/[id]/components/edit-repair-order-dialog.tsx` - Added toast notifications
5. `package.json` - Added @radix-ui/react-toast dependency

## Future Enhancements

Potential improvements for the toast system:

1. **Toast Actions**: Add action buttons to toasts (e.g., "Undo", "View Details")
2. **Toast Queue**: Implement a queue system for multiple toasts
3. **Persistent Toasts**: Add option for toasts that don't auto-dismiss
4. **Toast Positioning**: Allow different positions (top-left, bottom-right, etc.)
5. **Sound Notifications**: Add optional sound effects for important toasts
6. **Toast History**: Keep a log of recent toasts for debugging
7. **Custom Icons**: Add icons to toasts for better visual feedback

## Testing Recommendations

1. **Success Scenarios**: Verify green toasts appear for all successful operations
2. **Error Scenarios**: Verify red toasts appear for all error cases
3. **Multiple Toasts**: Test behavior when multiple toasts are triggered quickly
4. **Mobile Responsiveness**: Test swipe-to-dismiss on mobile devices
5. **Accessibility**: Test with screen readers and keyboard navigation
6. **Auto-Dismiss**: Verify toasts dismiss after the configured timeout
7. **Long Messages**: Test with long titles and descriptions
8. **Network Errors**: Test toast behavior during network failures

## Troubleshooting

### Toast Not Appearing
- Ensure `<Toaster />` is added to the layout
- Check that `useToast` hook is imported correctly
- Verify the toast is being called (check console logs)

### Toast Styling Issues
- Check Tailwind CSS is properly configured
- Verify `class-variance-authority` is installed
- Ensure toast variants are defined correctly

### Multiple Toasts Overlapping
- Adjust `TOAST_LIMIT` in `use-toast.ts`
- Check z-index values in toast styles
- Verify viewport positioning

## Summary

The toast notification system provides a consistent, user-friendly way to give feedback across the manager interface. All operations now have synchronized toast messages:
- ✅ **Green toasts** for successful operations
- ❌ **Red toasts** for errors and failures

This improves the user experience by providing immediate, non-intrusive feedback for all critical actions.
