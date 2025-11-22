# dAItaniverse Settings Pages

Complete settings management system for user accounts, preferences, and security.

## Features Implemented

✅ **Profile Settings**
- Profile photo upload with preview
- First name, last name editing
- Bio with character counter (500 max)
- Pronouns selection
- Social links (Twitter, Instagram, LinkedIn, Website)
- Real-time validation
- Success/error notifications

✅ **Account Settings**
- Email display with verification status
- Username display
- Account ID for support reference
- Member since date
- Timezone selection (10+ timezones)
- Language selector (future-ready)
- Account deletion with confirmation

✅ **Password Management**
- Current password verification
- New password with strength indicator
- Real-time password strength calculation
- Password requirements checklist
- Confirm password matching
- Password tips and best practices
- Secure password validation (min 8 chars, uppercase, lowercase, number, special char)

✅ **Notifications**
- Email notification preferences (marketing, updates, digest, support)
- Push notification settings (browser, email, in-app)
- Feature-specific notifications (tickets, campaigns, social, websites)
- Toggle switches for easy management
- Save all preferences at once

✅ **Appearance**
- Theme selection (Light, Dark, System)
- Visual theme cards with icons
- Theme preview
- System preference detection
- Coming soon features preview

## Database Models

### Updated User Model
```prisma
model User {
  // Basic fields
  id, email, emailVerified, name, firstName, lastName, username, passwordHash

  // Profile fields
  profilePhotoUrl, bio, pronouns

  // Social links
  twitterHandle, linkedinUrl, instagramHandle, websiteUrl

  // Preferences
  timezone, theme, language

  // Timestamps
  createdAt, updatedAt, deletedAt (soft delete)
}
```

### UserPreferences Model
```prisma
model UserPreferences {
  // Email preferences
  emailMarketing, emailUpdates, emailDigest, emailSupport

  // Notification preferences
  notifBrowser, notifEmail, notifInApp

  // Feature notifications
  notifTickets, notifCampaigns, notifSocial, notifWebsites
}
```

## API Endpoints

### Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile (firstName, lastName, bio, pronouns, social links)

### Password
- `PUT /api/user/password` - Change password (validates current, updates to new)

### Preferences
- `GET /api/user/preferences` - Get notification preferences
- `PUT /api/user/preferences` - Update notification preferences

### Theme
- `PUT /api/user/theme` - Update theme preference (LIGHT, DARK, SYSTEM)

### Photo
- `POST /api/user/photo` - Upload profile photo (max 5MB, image files only)
- `DELETE /api/user/photo` - Remove profile photo

### Account
- `GET /api/user/account` - Get account info
- `PUT /api/user/account` - Update account settings (timezone, language)
- `DELETE /api/user/account` - Delete account (soft delete with 30-day grace period)

## UI Components

### New Components Created

**Toggle** (`src/components/ui/toggle.tsx`)
- Styled toggle switch
- Label and description support
- Disabled state
- Accessibility (ARIA)
- Pink gradient when active

**Select** (`src/components/ui/select.tsx`)
- Dropdown select input
- Label support
- Focus states
- Consistent styling

**Alert** (`src/components/ui/alert.tsx`)
- Multi-variant (success, error, warning, info, default)
- Icon support (Check, X, Alert, Info)
- Title and description
- Color-coded borders and backgrounds

**Textarea** (`src/components/ui/textarea.tsx`)
- Multi-line text input
- Auto-resize support
- Character counting
- Focus states

## Validation Utilities

### Password Validation (`src/lib/password.ts`)
- `validatePasswordStrength()` - Returns score (0-4), label, color, feedback
- `validatePassword()` - Check if password meets requirements
- `hashPassword()` - Hash password (placeholder for bcrypt)
- `verifyPassword()` - Verify password against hash

### Form Validation (`src/lib/validation.ts`)
- `validateEmail()` - Email format validation
- `validateUrl()` - URL format validation
- `validateUsername()` - Username rules (3-20 chars, alphanumeric)
- `validateBio()` - Bio length validation (max 500 chars)
- `validateName()` - Name validation (max 50 chars)
- `validateSocialHandle()` - Social media handle validation
- `sanitizeInput()` - Trim and sanitize user input

## Pages Structure

```
/settings
├── layout.tsx              # Settings layout with sidebar navigation
├── page.tsx                # Redirect to /settings/profile
├── profile/
│   └── page.tsx           # Profile settings
├── account/
│   └── page.tsx           # Account settings
├── password/
│   └── page.tsx           # Password change
├── notifications/
│   └── page.tsx           # Notification preferences
└── appearance/
    └── page.tsx           # Theme and appearance
```

## Features by Page

### Profile Settings (`/settings/profile`)
- **Profile Photo Section**
  - Circular photo display
  - Upload button (triggers file input)
  - Remove button (if photo exists)
  - File type/size validation
  - Preview before save

- **Basic Information Section**
  - First name and last name inputs (side by side)
  - Pronouns dropdown (she/her, he/him, they/them, other, prefer not to say)
  - Bio textarea with character counter (0/500)

- **Social Links Section**
  - Twitter (@ prefix)
  - Instagram (@ prefix)
  - LinkedIn (full URL)
  - Personal website (full URL)
  - URL validation

### Account Settings (`/settings/account`)
- **Account Information**
  - Email (read-only with verified badge)
  - Username (read-only)
  - Account ID (for support)
  - Member since date

- **Regional Settings**
  - Timezone dropdown (10 major timezones)
  - Language selector (English only, future-ready)

- **Danger Zone**
  - Delete account button
  - Confirmation modal:
    - Warning list (websites unpublished, data deleted, username released)
    - Type "DELETE" to confirm
    - Password verification
    - 30-day grace period notice

### Password Settings (`/settings/password`)
- **Change Password Form**
  - Current password input
  - New password input with strength meter
  - Confirm password input
  - Realtime strength calculation:
    - Score: 0-4
    - Label: Weak, Fair, Good, Strong
    - Color: Red, Orange, Yellow, Green
    - Progress bar visualization

- **Requirements Checklist**
  - At least 8 characters (✓/✗)
  - At least one uppercase letter (✓/✗)
  - At least one lowercase letter (✓/✗)
  - At least one number (✓/✗)
  - At least one special character (✓/✗)

- **Password Tips**
  - Use unique password
  - Combine letters, numbers, symbols
  - Avoid personal information
  - Use password manager
  - Change regularly

### Notifications Settings (`/settings/notifications`)
- **Email Notifications**
  - Marketing emails toggle
  - Product updates toggle
  - Weekly digest toggle
  - Support notifications toggle

- **Push Notifications**
  - Browser notifications toggle
  - Email notifications toggle
  - In-app notifications toggle

- **Feature Notifications**
  - Support tickets toggle
  - Marketing campaigns toggle
  - Social media posts toggle
  - Website updates toggle

### Appearance Settings (`/settings/appearance`)
- **Theme Selection**
  - Light theme card (Sun icon)
  - Dark theme card (Moon icon)
  - System theme card (Monitor icon)
  - Visual cards with checkmark when selected
  - Pink gradient border for active selection

- **Theme Preview**
  - Sample UI preview
  - Shows current theme application

- **Coming Soon**
  - Font size customization
  - Compact mode
  - Custom accent colors
  - High contrast mode

## Navigation

Left sidebar with 6 sections:
1. **Profile** (User icon)
2. **Account** (Settings icon)
3. **Password** (Lock icon)
4. **Notifications** (Bell icon)
5. **Appearance** (Palette icon)
6. **Billing** (CreditCard icon, "Pro" badge)

Active state:
- Pink-to-purple gradient background
- White text
- Highlight effect

Inactive state:
- Gray text
- Hover: light gray background

## Security Features

**Password Change:**
- Requires current password verification
- Validates new password strength
- Prevents reusing current password
- TODO: Send confirmation email
- TODO: Invalidate all sessions except current

**Account Deletion:**
- Requires typing "DELETE" to confirm
- Requires password verification
- Soft delete (deletedAt timestamp)
- Anonymizes data (email, names, photos cleared)
- 30-day grace period before permanent deletion
- TODO: Send confirmation email
- TODO: Schedule permanent deletion job
- TODO: Log out from all sessions

**Data Validation:**
- Server-side validation for all inputs
- Real-time client-side validation
- Sanitization of user inputs
- Rate limiting (future)
- CSRF protection (future)

## Photo Upload

**Client-side:**
- File type validation (image/* only)
- File size validation (max 5MB)
- Preview before upload
- FormData API for multipart upload

**Server-side:**
- TODO: Upload to S3/Cloudinary
- TODO: Generate thumbnail
- TODO: Image optimization
- TODO: Return CDN URL

**Current implementation:**
- Placeholder URL generation
- File validation
- Database update

## Styling

**Design System:**
- Pink-to-purple gradient for primary actions
- Gray scale for neutral elements
- Green for success states
- Red for error/danger states
- Yellow/Orange for warnings
- Blue for informational elements

**Components:**
- Card-based layout for sections
- Clean, spacious forms
- Consistent spacing (Tailwind)
- Mobile responsive
- Loading states
- Success/error feedback

**Icons (Lucide React):**
- User, Lock, Bell, Palette, CreditCard, Settings, Shield
- Upload, X, Check, Sun, Moon, Monitor
- CheckCircle, XCircle, AlertCircle, Info
- Trash2

## Usage

1. **Navigate to Settings:**
   - Click Settings link in navigation
   - Redirects to `/settings/profile`

2. **Edit Profile:**
   - Upload photo (optional)
   - Enter first/last name
   - Add bio (optional, max 500 chars)
   - Select pronouns (optional)
   - Add social links (optional)
   - Click "Save Changes"

3. **Change Password:**
   - Enter current password
   - Enter new password (watch strength meter)
   - Confirm new password
   - Click "Change Password"
   - Success notification appears

4. **Manage Notifications:**
   - Toggle any preference on/off
   - All toggles update state immediately
   - Click "Save Preferences" to persist

5. **Change Theme:**
   - Select Light, Dark, or System
   - Preview updates
   - Click "Save Preferences"
   - Theme applies immediately

6. **Delete Account:**
   - Go to Account settings
   - Click "Delete Account" in Danger Zone
   - Read warnings
   - Type "DELETE"
   - Enter password
   - Confirm deletion
   - Account scheduled for deletion

## Testing

1. **Profile:**
   - Upload photo, verify preview
   - Enter long bio (501 chars), check validation
   - Enter invalid URL, check error
   - Save, check success message

2. **Password:**
   - Enter weak password, check strength meter (red, score 0-2)
   - Enter strong password, check strength meter (green, score 4-5)
   - Mismatch passwords, check error
   - Reuse current password, check error
   - Valid change, check success

3. **Notifications:**
   - Toggle all switches
   - Save, refresh page
   - Verify toggles maintain state

4. **Appearance:**
   - Select each theme
   - Check preview updates
   - Save, refresh page
   - Verify theme persists

5. **Account:**
   - Attempt deletion without typing DELETE
   - Type DELETE, no password
   - Valid deletion flow (TODO: test with real auth)

## Future Enhancements

- [ ] Real authentication (NextAuth or similar)
- [ ] Actual photo upload to S3/Cloudinary
- [ ] Email verification flow
- [ ] Two-factor authentication (2FA)
- [ ] Session management (view/revoke devices)
- [ ] Export user data (GDPR)
- [ ] Account recovery
- [ ] Billing integration
- [ ] API keys management
- [ ] Privacy settings
- [ ] Activity log
- [ ] Connected apps/integrations
- [ ] Notification center/inbox
- [ ] Dark mode full implementation
- [ ] Font size customization
- [ ] Accessibility settings
- [ ] Keyboard shortcuts

## Known Limitations

- Photo upload is placeholder (needs cloud storage)
- Password hashing uses SHA-256 (use bcrypt in production)
- No real authentication (uses hardcoded userId)
- No rate limiting
- No CSRF protection
- No session management
- Account deletion doesn't actually send emails
- Theme doesn't persist across sessions (needs localStorage + SSR handling)

## Development

**Add new setting:**
1. Add field to User or UserPreferences model
2. Create/update API route
3. Add UI control to appropriate settings page
4. Add validation if needed
5. Test save/load flow

**Add new settings page:**
1. Create `src/app/settings/[name]/page.tsx`
2. Add to `settingsNavigation` in `layout.tsx`
3. Create corresponding API routes
4. Add to this documentation

---

**Built with:**
- Next.js 14 App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Radix UI
- Lucide Icons

**Status:** ✅ Complete and ready for testing
