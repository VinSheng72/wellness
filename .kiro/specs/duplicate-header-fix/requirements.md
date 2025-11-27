# Requirements Document

## Introduction

The frontend application currently displays duplicate navigation headers, creating a redundant and confusing user experience. The Navigation component in the root layout renders a header with "Wellness Event Booking" branding and a logout button, while both the HR Dashboard and Vendor Dashboard pages render their own separate headers with page titles, user information, and logout buttons. This results in two headers stacked on top of each other, wasting screen space and creating visual clutter.

## Glossary

- **Navigation Component**: The global navigation bar component rendered in the root layout that appears on all pages except login
- **Dashboard Pages**: The HR Dashboard and Vendor Dashboard pages that display event management interfaces
- **Root Layout**: The top-level layout component that wraps all pages in the application
- **User Context**: Information about the currently authenticated user including username and role

## Requirements

### Requirement 1

**User Story:** As a user navigating the application, I want a single, unified header that displays all relevant information, so that I have a clean interface without redundant navigation elements.

#### Acceptance Criteria

1. WHEN a user views any dashboard page THEN the system SHALL display exactly one header element
2. WHEN the header is rendered THEN the system SHALL include the application branding, current page title, user information, and logout functionality in a single unified component
3. WHEN a user switches between dashboard pages THEN the system SHALL update the header content without duplicating navigation elements
4. WHEN the page layout is rendered THEN the system SHALL maintain consistent spacing and visual hierarchy

### Requirement 2

**User Story:** As a user, I want to see my username and role-appropriate page title in the header, so that I can confirm my identity and current context.

#### Acceptance Criteria

1. WHEN an HR Admin views their dashboard THEN the system SHALL display "HR Admin Dashboard" as the page title in the header
2. WHEN a Vendor Admin views their dashboard THEN the system SHALL display "Vendor Admin Dashboard" as the page title in the header
3. WHEN any authenticated user views a dashboard THEN the system SHALL display their username in the header
4. WHEN the header displays user information THEN the system SHALL position it clearly and maintain visual balance with other header elements

### Requirement 3

**User Story:** As a user, I want a single logout button in the header, so that I can sign out without confusion about which logout button to use.

#### Acceptance Criteria

1. WHEN a user views any dashboard page THEN the system SHALL display exactly one logout button
2. WHEN a user clicks the logout button THEN the system SHALL clear the authentication session and redirect to the login page
3. WHEN the logout process is in progress THEN the system SHALL disable the logout button and display appropriate feedback
4. WHEN logout fails THEN the system SHALL still redirect the user to the login page to ensure security

### Requirement 4

**User Story:** As a user accessing the application root, I want to be automatically directed to the appropriate page based on my authentication status, so that I can quickly access my dashboard without manual navigation.

#### Acceptance Criteria

1. WHEN an unauthenticated user visits the root path THEN the system SHALL redirect them to the login page
2. WHEN an authenticated HR Admin user visits the root path THEN the system SHALL redirect them to the HR dashboard
3. WHEN an authenticated Vendor Admin user visits the root path THEN the system SHALL redirect them to the Vendor dashboard
4. WHEN the authentication status is being determined THEN the system SHALL display a loading indicator to prevent flickering
