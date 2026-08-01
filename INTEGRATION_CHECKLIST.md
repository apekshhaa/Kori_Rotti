# Hospital Dashboard Enhancement - Integration Checklist

## ✅ Frontend Implementation Complete

### Files Modified/Created

- [x] **frontend/src/services/referralApi.ts** (Updated)
  - Added `HospitalInfo` interface
  - Added `ReferralRerouteResponse` interface  
  - Added `fetchHospitalDetails()` function
  - Added `manualReroute()` function
  - Added `fetchReferralStatus()` function
  - Added `MOCK_HOSPITALS` data
  - ≈150 lines added

- [x] **frontend/src/components/hospital/HospitalPreparation.tsx** (NEW)
  - New wrapper component for hospital header + reroute
  - Full state management
  - Confirmation dialog
  - Error/success messages
  - ≈430 lines

- [x] **frontend/src/components/hospital/HospitalDashboard.tsx** (Updated)
  - Changed import: ReferralDetail → HospitalPreparation
  - Updated component usage
  - Added onReferralUpdate callback
  - 3 lines changed

- [x] **frontend/src/index.css** (Updated)
  - Added @keyframes fadeIn
  - Added .animate-fadeIn utility class
  - ≈10 lines added

- [x] **Documentation** (NEW - 4 files)
  - IMPLEMENTATION_SUMMARY.md
  - HOSPITAL_ENHANCEMENT_GUIDE.md
  - HOSPITAL_QUICK_REFERENCE.md
  - UI_UX_DESIGN_GUIDE.md

## 📋 Backend Implementation Required

### Priority 1: Critical APIs

#### 1. GET `/api/hospitals/{hospitalId}`

**Purpose:** Fetch hospital information for display

**Request:**
```
GET /api/hospitals/{hospitalId}
Headers: Accept: application/json
```

**Response (200 OK):**
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

**Error Response (404):**
```json
{
  "error": "Hospital not found"
}
```

**Implementation Tips:**
- Query hospital database by ID
- Return current bed availability
- Include active specialties/departments
- Cache response for 5-10 minutes if possible
- Return empty array for specialties if none available

#### 2. POST `/api/referrals/{referralId}/manual-reroute`

**Purpose:** Reroute patient to different hospital

**Request:**
```
POST /api/referrals/{referralId}/manual-reroute
Content-Type: application/json
Body: {}
```

**Response (200 OK):**
```json
{
  "success": true,
  "newHospitalId": "dist-hospital-2",
  "newHospital": {
    "id": "dist-hospital-2",
    "name": "City Medical Center",
    "phone": "+91-9876543211",
    "address": "456 Health Street, Downtown",
    "totalBeds": 200,
    "availableBeds": 8,
    "specialties": ["Emergency", "ICU", "Trauma"]
  },
  "rerouteCount": 1,
  "message": "Rerouting initiated. New hospital will receive alert."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Max reroutes exceeded. Patient has been rerouted 3 times."
}
```

**Implementation Tips:**
- Track rerouteCount in referral record
- Max 3 reroutes per referral (enforce in backend)
- Select next available hospital (based on beds/proximity)
- Send notification to new hospital
- Log reroute event with timestamp
- Update referral.hospitalId in database
- Don't change referral.status (stays "sent")
- Consider current hospital's capacity/specialties

#### 3. GET `/api/referrals/{referralId}/status`

**Purpose:** Fetch referral with reroute count

**Request:**
```
GET /api/referrals/{referralId}/status
Headers: Accept: application/json
```

**Response (200 OK):**
```json
{
  "id": "REF-2024-082",
  "referralId": "REF-2024-082",
  "patientId": "PHC-003",
  "patientName": "Lakshmi",
  "age": 62,
  "gender": "Female",
  "phc": "Demo Rural PHC",
  "timestamp": 1700000000000,
  "riskScore": 18,
  "riskLevel": "URGENT",
  "status": "sent",
  "hospitalId": "dist-hospital-1",
  
  // ... existing referral fields ...
  
  "rerouteCount": 0
}
```

**Implementation Tips:**
- Merge with existing referral endpoint
- Add `rerouteCount` field to response
- Initialize as 0 for new referrals
- Increment on successful reroute
- Return current hospitalId

## 🔧 Configuration

### Environment Variables

Update `.env` or deployment config:

```bash
# Frontend
VITE_API_URL=https://your-backend-api.com

# Backend  
DB_CONNECTION_STRING=...
HOSPITAL_NOTIFICATION_SERVICE=...
```

### API Base URL

The frontend automatically uses:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Ensure this points to your backend service.

## 🧪 Testing Checklist

### Frontend Testing

- [ ] Hospital name displays when component loads
- [ ] Phone number shows with icon
- [ ] Address displays (if available in API)
- [ ] Available beds display correctly
- [ ] Specialties show (max 2)
- [ ] Reroute button visible for "sent" status
- [ ] Reroute button disabled for other statuses
- [ ] Reroute button disabled when rerouteCount >= 3
- [ ] Dialog shows on button click
- [ ] Dialog displays current hospital name
- [ ] Cancel button closes dialog (no API call)
- [ ] Confirm button triggers API call
- [ ] Loading spinner shows during API call
- [ ] Success message shows on successful reroute
- [ ] Hospital info updates to new hospital
- [ ] Prep checklist resets (0 of 4)
- [ ] Error message shows on API failure
- [ ] Retry available on error
- [ ] Message auto-dismisses after 4 seconds
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px-1024px)
- [ ] Responsive on desktop (> 1024px)
- [ ] Dark mode styling works
- [ ] Light mode styling works (if enabled)
- [ ] Keyboard navigation works
- [ ] Touch targets are ≥ 44px

### Backend Testing

- [ ] `/api/hospitals/{id}` returns hospital object
- [ ] `/api/hospitals/{id}` with invalid ID returns 404
- [ ] `/api/hospitals/{id}` falls back gracefully
- [ ] `/api/referrals/{id}/manual-reroute` increments count
- [ ] `/api/referrals/{id}/manual-reroute` blocks after 3 attempts
- [ ] `/api/referrals/{id}/manual-reroute` updates hospitalId
- [ ] `/api/referrals/{id}/status` includes rerouteCount
- [ ] Rerouted patient gets assigned to new hospital
- [ ] New hospital receives notification
- [ ] Original hospital notified of reroute
- [ ] Reroute events logged for audit trail
- [ ] Rate limiting prevents abuse
- [ ] Error messages are helpful and clear

### Integration Testing

- [ ] Frontend → Backend API calls work end-to-end
- [ ] Hospital data flows correctly through component
- [ ] Reroute workflow works from button to success
- [ ] Prep checklist resets after real reroute
- [ ] Multiple reroutes work sequentially
- [ ] Max reroutes enforced correctly
- [ ] Error handling works across component layers
- [ ] Success/error messages appear as expected
- [ ] Database state updates correctly
- [ ] Timeline shows reroute events

### E2E Testing (Recommended)

```typescript
// Example Cypress test
describe('Hospital Reroute', () => {
  it('should reroute patient to another hospital', () => {
    cy.visit('/dashboard');
    cy.selectReferral('REF-2024-082');
    
    // Should show hospital name
    cy.contains('District Hospital A').should('be.visible');
    
    // Click reroute button
    cy.button('REROUTE').click();
    
    // Confirm dialog appears
    cy.contains('Confirm Reroute').should('be.visible');
    cy.button('Reroute').click();
    
    // Should show loading
    cy.contains('Rerouting...').should('be.visible');
    
    // Should show success
    cy.contains('Rerouting initiated').should('be.visible');
    
    // Hospital should change
    cy.contains('City Medical Center').should('be.visible');
    
    // Checklist should reset
    cy.contains('0 of 4 prepared').should('be.visible');
  });
});
```

## 📊 Data Validation

### Hospital Object Validation

```typescript
// Required fields
- id: string (non-empty)
- name: string (non-empty, ≤100 chars)
- phone: string (valid phone format)

// Optional fields  
- address: string (≤200 chars)
- totalBeds: number (≥0)
- availableBeds: number (0 ≤ available ≤ total)
- specialties: string[] (max 5 items, ≤50 chars each)
```

### Referral Validation

```typescript
// Required for reroute
- referralId: string (must exist)
- hospitalId: string (must exist)
- status: string (must be "sent")
- rerouteCount: number (must be < 3)

// Cannot reroute if
- status !== 'sent' (must be awaiting acknowledgment)
- rerouteCount >= 3 (max reroutes reached)
- patient.status === 'checked_in' (already admitted)
```

## 🚨 Error Handling Strategy

### Common Errors & Responses

| Error | HTTP Code | Frontend Behavior |
|-------|-----------|------------------|
| Hospital not found | 404 | Fall back to mock data |
| Hospital API timeout | 5xx | Show error, use mock |
| Max reroutes exceeded | 400 | Disable button, show warning |
| Patient not found | 404 | Show error message |
| Hospital full | 409 | Try next hospital automatically |
| Network error | - | Show offline message, retry available |
| Rate limited | 429 | Show "Too many requests" |
| Unauthorized | 401 | Redirect to login |

### Fallback Strategy

```
Reroute attempt:
  1. Try real API
  2. If fails: Use mock hospital data
  3. If still fails: Show error message
  4. Allow retry indefinitely

Hospital fetch:
  1. Try real API  
  2. If fails: Use mock hospital
  3. Show "(Demo)" indicator if mock
  4. Don't block UI
```

## 📈 Monitoring & Analytics

### Metrics to Track

```
- Reroute button clicks (total, per day)
- Reroute success rate (%)
- Reroute failure rate (% & reasons)
- Average reroutes per referral
- Referrals hitting max reroutes (count)
- Time from click to completion
- Error types (API timeout, not found, etc)
- Mock data usage rate
```

### Logging Events

```typescript
// Log these events to your analytics/logging service:

1. "reroute.initiated" 
   { referralId, currentHospital, timestamp }

2. "reroute.confirmed"
   { referralId, timestamp, duration }

3. "reroute.success"
   { referralId, newHospital, rerouteCount, timestamp }

4. "reroute.failed"
   { referralId, error, timestamp, retried }

5. "reroute.max_exceeded"
   { referralId, timestamp }
```

## 🔐 Security Considerations

### Input Validation
- [ ] Validate referralId format
- [ ] Validate hospitalId format
- [ ] Sanitize all API responses
- [ ] Check user permissions before reroute

### Rate Limiting
- [ ] Limit reroute attempts per referral
- [ ] Implement global rate limits
- [ ] Throttle API calls
- [ ] Prevent spam/abuse

### Authorization
- [ ] Verify user is hospital staff
- [ ] Check user belongs to hospital
- [ ] Log all reroute actions
- [ ] Audit trail for compliance

### Data Privacy
- [ ] Don't log patient names in errors
- [ ] Encrypt sensitive data in transit
- [ ] Don't expose hospital internal IDs
- [ ] Comply with HIPAA/local regulations

## 🚀 Deployment Steps

### 1. Pre-Deployment

```bash
# Frontend
cd frontend
npm install
npm run build
npm run lint      # Should pass
npm run test      # If tests exist

# Verify no errors
npm run type-check
```

### 2. Staging Deployment

```bash
# Deploy to staging environment
npm run deploy:staging

# Test all endpoints
# Run through testing checklist
# Get sign-off from team
```

### 3. Production Deployment

```bash
# Create backup
# Deploy frontend first
# Deploy backend APIs second
# Monitor for errors
# Rollback plan ready
```

### 4. Post-Deployment

```bash
# Verify in production
# Monitor error logs
# Check analytics data
# Gather user feedback
# Document any issues
# Update runbooks
```

## 📞 Support Contacts

### For Issues:

- **Frontend Bugs:** Check browser console, review HospitalPreparation.tsx
- **API Issues:** Check backend logs, verify endpoints exist
- **Styling Issues:** Check CSS in index.css, verify Tailwind config
- **Data Issues:** Check mock data in referralApi.ts, verify API responses

### Documentation:

- **Setup Guide:** HOSPITAL_ENHANCEMENT_GUIDE.md
- **Code Examples:** HOSPITAL_QUICK_REFERENCE.md
- **UI/UX Design:** UI_UX_DESIGN_GUIDE.md
- **Implementation Details:** IMPLEMENTATION_SUMMARY.md

## ✨ Next Phase Features (Future)

After core implementation is stable:

- [ ] Reroute history visualization
- [ ] Choose hospital before rerouting (not automatic)
- [ ] Real-time bed availability (WebSocket)
- [ ] SMS notifications to staff
- [ ] Reroute reason tracking
- [ ] Analytics dashboard
- [ ] A/B testing for reroute strategies
- [ ] Machine learning for hospital selection
- [ ] Integration with ambulance tracking

---

**Implementation Date:** August 1, 2026  
**Status:** ✅ COMPLETE (Frontend & Documentation)  
**Pending:** Backend API implementation  
**Estimated Backend Time:** 4-8 hours  
**Total Timeline:** 1-2 days (with testing)
