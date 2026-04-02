
## App Improvements Plan

### 1. 🔒 Password Reset Flow
- Add "Forgot Password" link on the Auth page
- Create a `/reset-password` page where users set a new password
- Wire up `resetPasswordForEmail` and `updateUser` calls

### 2. 🔒 Tighten RLS Policies
- Change `{public}` role policies on `training_sessions` and `module_completions` to `{authenticated}`

### 3. 🎯 Server-side Module Access Validation
- Add RLS or validation to prevent direct URL access to locked modules

### 4. 🎯 Session Recovery (connection drop protection)
- Auto-save training session state periodically so users can resume if connection drops

### 5. 🎯 Session History Filtering & Search
- Add date range filter, scenario type filter, and search to session history page

### 6. 📱 Code Refactoring
- Break Auth.tsx into smaller components
- Break useAuth.tsx into smaller pieces

### 7. 📱 First-time User Onboarding
- Show a welcome/getting-started flow on the dashboard for users with no completions

### 8. 📊 Manager Progress View
- Consolidated view showing each team member's module completion and scores

### 9. 📊 Export/Reporting
- Allow managers to export training data as CSV

We'll tackle these one at a time, starting with #1. Each step will be confirmed before moving to the next.
