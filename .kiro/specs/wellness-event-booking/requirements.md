# Requirements Document

## Introduction

This document specifies the requirements for a full-stack web application that facilitates online booking of wellness events (health talks, onsite screenings, etc.) and enables vendor approval or rejection of these events. The system supports two user roles: Company HR Administrators who create and manage wellness event requests, and Vendor Administrators who review and respond to event requests for their assigned event types.

## Glossary

- **System**: The Wellness Event Booking Web Application
- **HR Admin**: A Company Human Resource administrator account with permissions to create and view wellness events
- **Vendor Admin**: A vendor account with permissions to view, approve, or reject wellness events for their assigned event types
- **Wellness Event**: A health-related event such as health talks or onsite screenings that requires vendor approval
- **Event Request**: A wellness event submission created by an HR Admin containing proposed dates and location
- **Event Status**: The current state of an event request (Pending or Approved)
- **Proposed Date**: One of three dates suggested by the HR Admin for the wellness event
- **Confirmed Date**: The date selected by the Vendor Admin when approving an event request
- **Event Item**: A specific type of wellness event (e.g., health talk, onsite screening) that is associated with a particular vendor

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user (HR Admin or Vendor Admin), I want to securely log into the system with my credentials, so that I can access my role-specific dashboard and manage wellness events.

#### Acceptance Criteria

1. WHEN a user enters valid credentials and submits the login form, THEN the System SHALL authenticate the user and redirect them to their role-specific dashboard
2. WHEN a user enters invalid credentials and submits the login form, THEN the System SHALL display an error message and prevent access to the dashboard
3. WHEN an authenticated user session expires, THEN the System SHALL redirect the user to the login page
4. THE System SHALL maintain separate authentication contexts for HR Admin and Vendor Admin roles

### Requirement 2: Event Request Creation

**User Story:** As an HR Admin, I want to create wellness event requests with proposed dates and location, so that vendors can review and approve events for my company.

#### Acceptance Criteria

1. WHEN an HR Admin accesses the event creation interface, THEN the System SHALL auto-populate the company name field based on the authenticated user account
2. WHEN an HR Admin submits an event request, THEN the System SHALL require exactly three proposed dates to be provided
3. WHEN an HR Admin submits an event request, THEN the System SHALL require one proposed location to be provided
4. WHEN an HR Admin submits an event request, THEN the System SHALL require an event item to be selected from a dropdown list
5. WHEN an HR Admin successfully submits an event request, THEN the System SHALL create the event with status set to Pending and capture the current timestamp as date created
6. WHEN an event request is created, THEN the System SHALL assign the event to the vendor associated with the selected event item

### Requirement 3: HR Admin Dashboard

**User Story:** As an HR Admin, I want to view all wellness events created by my company in a dashboard, so that I can track the status and details of event requests.

#### Acceptance Criteria

1. WHEN an HR Admin accesses their dashboard, THEN the System SHALL display a table containing all events created by that HR Admin's company
2. WHEN displaying events in the HR Admin dashboard, THEN the System SHALL show event name, vendor name, confirmed date or proposed dates, status, date created, and a view button for each event
3. WHEN an event has a confirmed date, THEN the System SHALL display the confirmed date in the dashboard table
4. WHEN an event does not have a confirmed date, THEN the System SHALL display the three proposed dates in the dashboard table
5. WHEN an HR Admin clicks the view button for an event, THEN the System SHALL display a popup modal with all event information

### Requirement 4: Vendor Admin Dashboard

**User Story:** As a Vendor Admin, I want to view wellness events assigned to my vendor account, so that I can review and respond to event requests.

#### Acceptance Criteria

1. WHEN a Vendor Admin accesses their dashboard, THEN the System SHALL display a table containing only events associated with that vendor's event items
2. WHEN displaying events in the Vendor Admin dashboard, THEN the System SHALL show event name, vendor name, confirmed date or proposed dates, status, date created, and a view button for each event
3. WHEN an event has a confirmed date, THEN the System SHALL display the confirmed date in the dashboard table
4. WHEN an event does not have a confirmed date, THEN the System SHALL display the three proposed dates in the dashboard table
5. WHEN a Vendor Admin clicks the view button for an event, THEN the System SHALL display a popup modal with all event information and action buttons

### Requirement 5: Event Approval Process

**User Story:** As a Vendor Admin, I want to approve wellness event requests by selecting a confirmed date, so that the HR Admin knows which proposed date works for my organization.

#### Acceptance Criteria

1. WHEN a Vendor Admin views an event popup with Pending status, THEN the System SHALL display Approve and Reject buttons
2. WHEN a Vendor Admin clicks the Approve button, THEN the System SHALL prompt the vendor to select one of the three proposed dates
3. WHEN a Vendor Admin selects a proposed date and confirms approval, THEN the System SHALL update the event status to Approved and store the selected date as the confirmed date
4. WHEN an event is approved, THEN the System SHALL persist the confirmed date and updated status to the database
5. WHEN a Vendor Admin views an event popup with Approved status, THEN the System SHALL not display Approve or Reject buttons

### Requirement 6: Event Rejection Process

**User Story:** As a Vendor Admin, I want to reject wellness event requests with a reason, so that the HR Admin understands why the event cannot be accommodated.

#### Acceptance Criteria

1. WHEN a Vendor Admin clicks the Reject button on a Pending event, THEN the System SHALL display a text input field for entering rejection remarks
2. WHEN a Vendor Admin enters rejection remarks and confirms rejection, THEN the System SHALL update the event status to Rejected and store the remarks
3. WHEN a Vendor Admin attempts to reject an event without entering remarks, THEN the System SHALL prevent the rejection and prompt for remarks to be entered
4. WHEN an event is rejected, THEN the System SHALL persist the rejection remarks and updated status to the database

### Requirement 7: Data Persistence and Integrity

**User Story:** As a system administrator, I want all event data to be reliably stored and retrieved from the database, so that users can access accurate and up-to-date information.

#### Acceptance Criteria

1. WHEN an event request is created, THEN the System SHALL persist all event fields to the MongoDB database
2. WHEN an event status changes, THEN the System SHALL update the database record immediately
3. WHEN a user accesses their dashboard, THEN the System SHALL retrieve current event data from the MongoDB database
4. THE System SHALL maintain referential integrity between events, companies, vendors, and event items
5. WHEN querying events, THEN the System SHALL filter results based on the authenticated user's role and associated company or vendor

### Requirement 8: Location Input Enhancement

**User Story:** As an HR Admin, I want to enter a postal code and have the street name auto-populated, so that I can quickly and accurately specify event locations.

#### Acceptance Criteria

1. WHEN an HR Admin enters a valid postal code in the location field, THEN the System SHALL attempt to retrieve and populate the corresponding street name
2. WHEN postal code lookup is unavailable or fails, THEN the System SHALL allow the HR Admin to enter location as free text
3. WHEN a postal code lookup succeeds, THEN the System SHALL display both the postal code and street name in the event details

### Requirement 9: Multi-Tenancy and Data Isolation

**User Story:** As a user, I want to see only the events relevant to my role and organization, so that I can focus on my responsibilities without viewing unrelated data.

#### Acceptance Criteria

1. WHEN an HR Admin accesses their dashboard, THEN the System SHALL display only events created by their company
2. WHEN a Vendor Admin accesses their dashboard, THEN the System SHALL display only events associated with their vendor's event items
3. THE System SHALL enforce data isolation at the database query level to prevent unauthorized access to other organizations' events
4. WHEN retrieving event data, THEN the System SHALL filter based on the authenticated user's company or vendor association

### Requirement 10: Scalable Event Item Management

**User Story:** As a system administrator, I want event items and vendor associations to be configurable, so that new event types and vendors can be added without code changes.

#### Acceptance Criteria

1. THE System SHALL store event items and their vendor associations in the MongoDB database
2. WHEN displaying the event item dropdown, THEN the System SHALL dynamically populate options from the database
3. WHEN a new event item is added to the database, THEN the System SHALL make it available in the event creation interface without requiring code deployment
4. THE System SHALL maintain a many-to-one relationship between event items and vendors
