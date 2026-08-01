# Hospital Dashboard Enhancement - Implementation Guide

## Overview

This document describes the enhanced hospital preparation dashboard with:
1. **Hospital Name & Phone Display** - Shows current hospital details at the top
2. **Reroute Button** - Allows manual rerouting to another hospital with confirmation dialog
3. **Dynamic Content** - Fetches hospital info and preparation checklist from API
4. **Full State Management** - Loading states, error handling, success messages

## Features Implemented

### 1. Hospital Name Display

**Location:** Top of the referral detail card

**Displays:**
- Hospital name (large, bold white text)
- Phone number with icon
- Address (if available)
- Available beds / total beds
- Hospital specialties (first 2)

**Styling:**
- Dark gradient background (slate-800 → slate-950)
- Matches existing dark theme
- Responsive layout (stacks on mobile)

### 2. Reroute Button

**Location:** Top-right corner of hospital header

**Visibility:**
- Only visible when referral status is "sent" (AWAITING_ACKNOWLEDGMENT)
- Disabled if patient has been rerouted 3+ times
- Shows appropriate button state and tooltip

**On Click:**
- Shows confirmation dialog
- Displays current hospital name
- Explains impact of rerouting

**Functionality:**
- Calls: `POST /api/referrals/{referralId}/manual-reroute`
- Handles loading state with spinner
- Shows success/error messages
- Automatically refreshes hospital details on success
- Increments reroute counter

### 3. API Endpoints

#### New API Functions in `referralApi.ts`

##### `fetchHospitalDetails(hospitalId: string)`
```typescript
// GET /api/hospitals/{hospitalId}
// Returns: HospitalInfo object with name, phone, address, beds, specialties
```

**Response:**
```json
{
  "id": "dist-hospital-1",
  "name": "District Hospital A",
  "phone": "+91-9876543210",
  "address": "123 Medical Plaza, City Center",
  "totalBeds": 150,
  "availableBeds": 12,
  "specialties": ["Emergency", "Cardiology", "Pulmonology"]
}
```

##### `manualReroute(referralId: string)`
```typescript
// POST /api/referrals/{referralId}/manual-reroute
// Body: {}
// Returns: ReferralRerouteResponse
```

**Response:**
```json
{
  "success": true,
  "newHospitalId": "dist-hospital-2",
  "newHospital": { /* hospital object */ },
  "rerouteCount": 1,
  "message": "Rerouting initiated. New hospital will receive alert."
}
```

##### `fetchReferralStatus(referralId: string)`
```typescript
// GET /api/referrals/{referralId}/status
// Returns: referral, hospital info, and reroute count
```

### 4. New Component: HospitalPreparation

**File:** `frontend/src/components/hospital/HospitalPreparation.tsx`

**Props:**
```typescript
interface HospitalPreparationProps {
  referral: NormalizedReferral;
  onStatusUpdate: (referralId: string, newStatus: 'acknowledged' | 'arrived' | 'checked_in') => void;
  onReferralUpdate?: (updatedReferral: NormalizedReferral) => void;
  onDelete?: (referralId: string) => void;
  onClose?: () => void;
}
```

**Features:**
- Loads hospital data on mount
- Tracks reroute count (max 3)
- Shows confirmation dialog before rerouting
- Handles loading, error, and success states
- Resets prep checklist when hospital changes
- Wraps existing ReferralDetail component

**State Management:**
```typescript
- hospital: HospitalInfo | null          // Current hospital data
- hospitalLoading: boolean                // Hospital fetch status
- hospitalError: string | null            // Hospital fetch error
- rerouteCount: number                    // Number of times rerouted
- maxReroutesReached: boolean             // Whether max reroutes exceeded
- showRerouteConfirm: boolean             // Confirmation dialog visibility
- isRerouting: boolean                    // Reroute in progress
- rerouteError: string | null             // Reroute error message
- rerouteSuccess: string | null           // Reroute success message
```

### 5. Styling & Theme

**Color Palette:**
- Hospital header: `bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950`
- Reroute button: `bg-orange-600 hover:bg-orange-700` (warning color)
- Success message: `bg-emerald-950/50 border-emerald-800/50`
- Error message: `bg-red-950/50 border-red-800/50`
- Warning message: `bg-amber-950/50 border-amber-800/50`

**Responsive Design:**
- Mobile: Stacks vertically, button shows icon only
- Desktop: Hospital name and button side-by-side
- Touch-friendly sizes (44px minimum)

### 6. Error Handling

**Hospital Fetch Errors:**
- Shows "Unable to load hospital details" message
- Falls back to mock hospital data if available
- Does not block UI

**Reroute Errors:**
- Shows error message in red box
- Displays original error from API
- Button remains available for retry

**Max Reroutes:**
- Shows warning message when limit reached
- Disables reroute button with tooltip
- Suggests manual dispatch escalation

### 7. User Flow

```
1. Hospital staff opens referral detail
   ↓
2. HospitalPreparation component loads
   ↓
3. Hospital info fetched and displayed
   ↓
4. Staff reviews patient info and caregiver flags
   ↓
5. If patient needs different hospital:
   a. Click REROUTE button
   b. Confirm action in dialog
   c. System calls manual-reroute API
   d. Success message shown
   e. Hospital details updated
   f. Prep checklist reset (0 of 4)
   ↓
6. If already rerouted 3+ times:
   - Button disabled
   - Warning message shown
   - Manual escalation required
```

## Integration Checklist

### Backend Requirements

Implement these endpoints in your backend:

1. **GET `/api/hospitals/{hospitalId}`**
   - Returns hospital info with name, phone, address, beds, specialties
   - Mock data provided for testing

2. **POST `/api/referrals/{referralId}/manual-reroute`**
   - Accept empty body
   - Find next available hospital
   - Send alert to new hospital
   - Increment reroute counter
   - Return: newHospitalId, newHospital object, rerouteCount, message

3. **GET `/api/referrals/{referralId}/status`**
   - Include rerouteCount in response
   - Return current hospital ID and status

### Frontend Setup

Files modified:
- `frontend/src/services/referralApi.ts` - Added 3 new API functions
- `frontend/src/components/hospital/HospitalDashboard.tsx` - Updated to use HospitalPreparation
- `frontend/src/components/hospital/HospitalPreparation.tsx` - New component (created)
- `frontend/src/index.css` - Added fadeIn animation

### Testing

**Mock Hospital Data:**
```typescript
{
  'dist-hospital-1': {
    name: 'District Hospital A',
    phone: '+91-9876543210',
    address: '123 Medical Plaza, City Center',
    totalBeds: 150,
    availableBeds: 12,
    specialties: ['Emergency', 'Cardiology', 'Pulmonology']
  },
  'dist-hospital-2': {
    name: 'City Medical Center',
    phone: '+91-9876543211',
    address: '456 Health Street, Downtown',
    totalBeds: 200,
    availableBeds: 8,
    specialties: ['Emergency', 'ICU', 'Trauma']
  },
  'dist-hospital-3': {
    name: 'Regional Health Complex',
    phone: '+91-9876543212',
    address: '789 Wellness Road, North Wing',
    totalBeds: 180,
    availableBeds: 15,
    specialties: ['General', 'Pediatrics', 'Gynecology']
  }
}
```

**Test Cases:**
- [ ] Hospital name and phone display on load
- [ ] Reroute button visible when status = "sent"
- [ ] Reroute button disabled when status ≠ "sent"
- [ ] Reroute button disabled after 3 reroutes
- [ ] Confirmation dialog shows on button click
- [ ] Successful reroute updates hospital info
- [ ] Error message displays on reroute failure
- [ ] Prep checklist resets after hospital change
- [ ] Loading spinner shows during reroute

## Performance Notes

- Hospital data fetched only once on component mount or referral change
- Reroute count checked from API (not stored locally)
- Preparation checklist uses localStorage for persistence
- Dialog uses portal for clean z-index management

## Accessibility

- Reroute button has proper `title` attribute for tooltip
- Confirmation dialog is keyboard accessible
- All icons have descriptive text labels
- Color combinations meet WCAG AA standards
- Spinner animation loops smoothly (respects prefers-reduced-motion in production)

## Future Enhancements

1. **Reroute History**
   - Show timeline of reroutes
   - Display which hospitals rejected patient
   - Add reason for reroute (if provided by staff)

2. **Smart Routing**
   - Show available hospitals before reroute
   - Staff selects preferred hospital
   - Check real-time bed availability

3. **Notifications**
   - Send alert to original hospital if rerouted
   - Notify new hospital of pending arrival
   - Update ambulance driver with new destination

4. **Analytics**
   - Track reroute frequency
   - Identify bottleneck hospitals
   - Monitor reroute success rates

## Troubleshooting

**Hospital details not loading?**
- Check if `/api/hospitals/{hospitalId}` endpoint is implemented
- Verify hospitalId is being passed correctly
- Check browser console for network errors
- Falls back to mock data if API fails

**Reroute button not appearing?**
- Verify referral status is "sent"
- Check if referral.status is lowercase in API response
- Ensure HospitalPreparation is imported in HospitalDashboard

**Prep checklist not resetting?**
- Check localStorage key format: `prep_checklist_{referralId}`
- Verify onReferralUpdate callback is being called
- May need manual page refresh if localStorage persists

## Code Quality

- TypeScript strict mode enabled
- Full type safety for API responses
- Error boundaries for failed API calls
- Graceful fallback to mock data
- Production-ready state management
- Clean component separation
