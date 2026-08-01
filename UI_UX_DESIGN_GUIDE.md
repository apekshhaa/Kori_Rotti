# Hospital Dashboard - UI/UX Design Guide

## Visual Overview

### 1. Hospital Header Section

```
╔════════════════════════════════════════════════════════════════════╗
║ 🌙  DARK THEME - Hospital Header with Reroute Button              ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  District Hospital A                                [REROUTE]     ║
║  📱 +91-9876543210                                                ║
║  📍 123 Medical Plaza, City Center                                ║
║                                                                    ║
║  🛏️  Available Beds: 12 / 150    🏥 Emergency 🏥 Cardiology      ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

### 2. Hospital Header with Success Message

```
╔════════════════════════════════════════════════════════════════════╗
║  District Hospital B (After Reroute)                              ║
║  📱 +91-9876543211                                                ║
║  📍 456 Health Street, Downtown                                   ║
║                                                                    ║
║  ✓ Rerouting Initiated                                            ║
║    New hospital will receive alert.                               ║
║                                                                    ║
║  🛏️  Available Beds: 8 / 200    🏥 Emergency 🏥 ICU               ║
╚════════════════════════════════════════════════════════════════════╝
```

### 3. Hospital Header with Max Reroutes Warning

```
╔════════════════════════════════════════════════════════════════════╗
║  District Hospital A                                    [REROUTE]  ║
║  📱 +91-9876543210                  (Button: Disabled/Grayed Out) ║
║  📍 123 Medical Plaza, City Center                                ║
║                                                                    ║
║  ⚠️  Max Reroutes Exceeded                                        ║
║     Patient has been rerouted 3 times. Escalating to manual       ║
║     dispatch.                                                      ║
║                                                                    ║
║  🛏️  Available Beds: 12 / 150    🏥 Emergency 🏥 Cardiology      ║
╚════════════════════════════════════════════════════════════════════╝
```

### 4. Reroute Confirmation Dialog

```
┌────────────────────────────────────┐
│      ⚠️  Confirm Reroute?          │
├────────────────────────────────────┤
│                                    │
│  Are you sure you want to reroute  │
│  this patient to another hospital? │
│                                    │
│  This will escalate the referral   │
│  to a different facility and the   │
│  new hospital will receive an      │
│  alert.                            │
│                                    │
│  Current hospital:                 │
│  District Hospital A               │
│                                    │
│  ┌─────────────┐  ┌─────────────┐ │
│  │   Cancel    │  │  🏥 Reroute │ │
│  └─────────────┘  └─────────────┘ │
│                                    │
└────────────────────────────────────┘
```

### 5. Reroute in Progress

```
┌────────────────────────────────────┐
│      ⚠️  Confirm Reroute?          │
├────────────────────────────────────┤
│                                    │
│  Current hospital:                 │
│  District Hospital A               │
│                                    │
│  ┌─────────────┐  ┌─────────────┐ │
│  │   Cancel    │  │ ⟳ Rerouting...│
│  └─────────────┘  └─────────────┘ │
│                  (Disabled)        │
└────────────────────────────────────┘
```

## Complete Page Layout

### Desktop View (≥ 768px)

```
┌─────────────────────────────────────────────────────────────────┐
│ HOSPITAL DASHBOARD                                    🌙 Settings│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Incoming referrals 🔴                                          │
│  2 urgent referrals incoming                                    │
│                                                                 │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐ │
│  │ Queue (Left)     │  │ Details (Right)                     │ │
│  ├──────────────────┤  ├─────────────────────────────────────┤ │
│  │                  │  │                                     │ │
│  │ ⚠️ Referral 1     │  │ District Hospital A      [REROUTE]  │ │
│  │ URGENT - ETA 15m │  │ 📱 +91-9876543210                  │ │
│  │                  │  │ 📍 123 Medical Plaza               │ │
│  │ ⚠️ Referral 2     │  │                                     │ │
│  │ URGENT - ETA 35m │  │ 🛏️ Beds: 12 / 150                  │ │
│  │                  │  │                                     │ │
│  │ 🟡 Referral 3     │  │ ─────────────────────────────────  │ │
│  │ WATCH - ETA 90m  │  │                                     │ │
│  │                  │  │ Patient: Lakshmi (62F)             │ │
│  │                  │  │ ETA: 15 min | EWS Score: 18        │ │
│  │                  │  │                                     │ │
│  │                  │  │ Vitals Grid (Pulse, BP, SpO2, etc)│ │
│  │                  │  │                                     │ │
│  │                  │  │ Caregiver Observations             │ │
│  │                  │  │ 🔍 Breathing harder                │ │
│  │                  │  │                                     │ │
│  │                  │  │ Recent Trend                        │ │
│  │                  │  │ SpO2: 97 → 95 → 92%               │ │
│  │                  │  │                                     │ │
│  │                  │  │ Preparation Checklist               │ │
│  │                  │  │ ■■□□ 2 of 4 prepared               │ │
│  │                  │  │                                     │ │
│  │                  │  │ [Acknowledge Referral Button]      │ │
│  │                  │  │                                     │ │
│  │                  │  │ Timeline Events                     │ │
│  │                  │  │                                     │ │
│  └──────────────────┘  └─────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile View (< 768px)

```
┌──────────────────────────────────┐
│ HOSPITAL DASHBOARD          🌙    │
├──────────────────────────────────┤
│ Incoming referrals               │
│ 2 urgent incoming                │
├──────────────────────────────────┤
│                                  │
│ District Hospital A           🏥 │
│ 📱 +91-9876543210               │
│ 📍 123 Medical Plaza            │
│                                  │
│ 🛏️ Beds: 12 / 150               │
│                                  │
│ [Full-width Reroute Button]      │
│                                  │
│ ─────────────────────────────    │
│                                  │
│ Patient: Lakshmi (62F)           │
│ ETA: 15 min | EWS: 18            │
│                                  │
│ Vitals Grid (Stack Vertically)  │
│                                  │
│ Caregiver Observations           │
│ 🔍 Breathing harder              │
│                                  │
│ Recent Trend                     │
│ SpO2: 97 → 95 → 92%             │
│                                  │
│ Preparation Checklist            │
│ ■■□□ 2 of 4 prepared             │
│                                  │
│ [Acknowledge Referral]           │
│                                  │
│ Timeline                         │
│                                  │
└──────────────────────────────────┘
```

## Color Scheme

### Light Mode (Rarely used, but included)

| Element | Color | Code |
|---------|-------|------|
| Background | Light gray/white | #fbf8f6 |
| Text Primary | Dark gray | #1a1b22 |
| Text Secondary | Medium gray | #5b3f47 |
| Hospital Header | Slate 900 | #0f172e |
| Reroute Button | Orange 600 | #ea580c |
| Success | Emerald 100 | #d1fae5 |
| Error | Red 50 | #fef2f2 |

### Dark Mode (Primary)

| Element | Color | Code |
|---------|-------|------|
| Background | Very dark purple | #130f12 |
| Surface | Dark purple | #1a1316 |
| Text Primary | Light purple | #f1effa |
| Text Secondary | Light mauve | #e3bdc7 |
| Hospital Header | Slate 950 (gradient) | #030712 → #0f0a0d |
| Border | Dark slate | #382a33 |
| Reroute Button | Orange 600 | #ea580c |
| Success | Emerald 950/50 | #051f1a |
| Warning | Amber 950/50 | #2d1f0b |
| Error | Red 950/50 | #2d0809 |

## Typography

### Font Family
- Primary: 'Geist', sans-serif
- Fallback: system font stack

### Font Sizes

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Hospital Name | 24px (mobile) / 30px (desktop) | 900 (black) | Primary heading |
| Phone/Address | 14px | 500 (medium) | Secondary info |
| Button Text | 13px | 700 (bold) | Call-to-action |
| Dialog Title | 18px | 700 (bold) | Modal heading |
| Message Text | 12px-14px | 600 (semibold) | Status updates |
| Labels | 11px-12px | 700 (bold) | Section headers |

## Spacing

### Padding
- Hospital header: 24px (1.5rem)
- Dialog padding: 24px
- Button padding: 10px-16px (vertical) × 16px (horizontal)

### Gaps
- Between sections: 16px (1rem)
- Between items in grid: 12px (0.75rem)
- Between icon and text: 8px (0.5rem)

### Borders
- Rounded corners: 12-20px (consistent with app)
- Border width: 1px
- Border opacity: Full (dark mode) / 0.8 (light mode)

## Icons Used

| Icon | Name | Used For | Size |
|------|------|----------|------|
| 📱 | phone | Phone number | 18px |
| 📍 | location_on | Address | 18px |
| 🛏️ | bed | Beds available | 20px |
| 🏥 | local_hospital | Reroute, hospital specialty | 18-24px |
| ⚠️ | warning | Warning, confirmation | 24px |
| ✓ | check_circle | Success message | 20px |
| ❌ | error | Error message | 20px |
| ⟳ | loading | Loading spinner | 16px |

All icons from Google Material Symbols (outlined style)

## Animations

### Fade In (Dialog Opening)
```
Duration: 300ms
Easing: ease-out
Effect: Opacity 0→1, Scale 0.95→1
Smooth entrance for confirmation dialog
```

### Loading Spinner
```
Duration: 1s
Easing: linear
Effect: Rotation 0→360°
Continuous loop during API call
```

### Message Auto-Dismiss
```
Duration: 4s
Effect: Auto-fade out success message
User can still interact during this time
```

### Button Hover
```
Duration: 200ms
Effect: Background color shift
Orange 600 → Orange 700
Subtle scale on click (0.99)
```

## Responsive Behavior

### Breakpoint: 768px

**Below 768px (Mobile):**
- Hospital name: 24px font
- Reroute button: Icon only (text hidden)
- Layout: Column stack
- Dialog: Full width with 16px margins
- Message boxes: 100% width

**768px and Above (Desktop):**
- Hospital name: 30px font
- Reroute button: Text visible "REROUTE"
- Layout: Row (name left, button right)
- Dialog: 400px max-width, centered
- Message boxes: Inline with content

## Interactive States

### Reroute Button States

#### 1. Enabled (Clickable)

```
╔═══════════════════════════════════╗
║ 🏥  REROUTE                       ║  Background: Orange 600
║ (hover: Orange 700)               ║  Text: White
║ (active: Scale 0.95)              ║  Cursor: pointer
╚═══════════════════════════════════╝
```

#### 2. Disabled (Max Reroutes)

```
╔═══════════════════════════════════╗
║ ⛔ MAX REROUTES                    ║  Background: Slate 700 (50% opacity)
║ (hover: no change)                ║  Text: Slate 400
║ (cursor: not-allowed)             ║  Cursor: not-allowed
║ (tooltip: "Max reroutes exceeded")║
╚═══════════════════════════════════╝
```

#### 3. Disabled (Wrong Status)

```
╔═══════════════════════════════════╗
║ 🏥 REROUTE                        ║  Background: Slate 600
║ (hover: no change)                ║  Text: Slate 400 (60% opacity)
║ (cursor: not-allowed)             ║  Cursor: not-allowed
║ (tooltip: "Only available when    ║
║  status is AWAITING_ACK")         ║
╚═══════════════════════════════════╝
```

#### 4. Loading

```
╔═══════════════════════════════════╗
║ ⟳ Rerouting...                    ║  Background: Orange 600
║ (spinning)                        ║  Text: White
║ (cursor: wait)                    ║  Button: Disabled
║ (no interaction)                  ║
╚═══════════════════════════════════╝
```

### Message Box States

#### Success (Green/Emerald)
```
├─ Icon: ✓ check_circle (green)
├─ Background: Emerald 950/50
├─ Border: Emerald 800/50
├─ Text: Emerald 200 (heading), Emerald 100 (detail)
└─ Duration: 4s (auto-dismiss)
```

#### Error (Red)
```
├─ Icon: ❌ error (red)
├─ Background: Red 950/50
├─ Border: Red 800/50
├─ Text: Red 200 (heading), Red 100 (detail)
└─ Duration: Until dismissed by retry
```

#### Warning (Amber)
```
├─ Icon: ⚠️ warning (amber)
├─ Background: Amber 950/50
├─ Border: Amber 800/50
├─ Text: Amber 200 (heading), Amber 100 (detail)
└─ Duration: Persistent (until resolved)
```

## Accessibility Features

### Keyboard Navigation
```
Tab: Move to reroute button
Enter/Space: Activate reroute button
Tab (in dialog): Move through Cancel/Confirm buttons
Enter: Confirm reroute
Escape: Cancel dialog
```

### Screen Reader Support
```
- Button has aria-label or title
- Dialog has proper role="dialog"
- Error messages announced
- Loading state announced
- Success message announced
```

### Color Contrast
```
- All text ≥ 4.5:1 contrast ratio (WCAG AA)
- Icons have accompanying text
- Color not sole means of conveying info
```

### Touch Targets
```
- All buttons ≥ 44×44px
- Icon buttons ≥ 40×40px
- Spacing between targets ≥ 8px
```

## Edge Cases & Error States

### Case 1: Hospital API Fails
```
Hospital Header shows:
- Hospital name (gray placeholder)
- "Unable to load hospital details"
- Error message in small text
- Falls back to mock data if available
- Reroute button still functional
```

### Case 2: Reroute API Fails
```
Dialog closes
Error message shows:
- Red background with error icon
- Original error message from API
- "Retry" available via button click
```

### Case 3: Patient Already Rerouted 3 Times
```
Hospital Header shows:
- Hospital name normally
- Reroute button disabled (gray)
- Warning message with explanation
- "Max reroutes exceeded" message
- Suggests manual escalation
```

### Case 4: Network Timeout
```
After 5 seconds:
- Show timeout error
- Provide retry option
- Log error to console
- No automatic retry
```

## Performance Indicators

### Loading States
```
Hospital Loading:
- Skeleton placeholder (animated pulse)
- Shows while fetchHospitalDetails() in progress
- Auto-resolved on success or error

Reroute Loading:
- Spinning icon in button
- Button disabled
- Dialog remains open
- Progress visible to user
```

## Print Style (Optional)

Not typically printed, but included for completeness:
```
- Hide reroute button
- Hide dialog overlays
- Print hospital name and details
- Include referral information
- Print as single page (landscape optimal)
```

---

## Design System Consistency

This enhancement maintains consistency with existing Kori Rotti UI:
- ✓ Dark theme primary
- ✓ Material Design icons
- ✓ Rounded corners (12-20px)
- ✓ Gradient backgrounds
- ✓ Smooth animations
- ✓ Responsive mobile-first
- ✓ Accessible color contrasts
- ✓ Clear information hierarchy
