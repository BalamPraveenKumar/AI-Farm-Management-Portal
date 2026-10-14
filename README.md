# 🌾 AI-Digital Farm Management Portal

An AI-powered livestock management platform built using **React** and **ServiceNow** that enables Farmers, District Admins, and Authority Admins to efficiently manage farms, animal batches, vaccinations, disease reporting, biosecurity compliance, incidents, and notifications through secure Scripted REST APIs and enterprise-grade role-based access control.

---

# 📌 Features

### 👨‍🌾 Farmer

* Secure Login
* Farm Management
* Animal Batch Management
* Vaccination Tracking
* Disease Reporting
* AI Disease Analysis (Groq AI)
* Biosecurity Checklist
* Incident Reporting
* Notifications
* Profile Management

### 🏢 District Admin

* Manage Farms in Assigned District
* Monitor Vaccinations
* View Disease Reports
* Send Notifications to Farmers
* Manage Incidents
* District-wise Monitoring

### 🏛️ Authority Admin

* Manage Districts
* Manage District Administrators
* View All Farms
* Monitor State-wide Disease Reports
* Send Notifications to Farmers
* Incident Monitoring
* Centralized Administration

---

# 🚀 Technology Stack

### Frontend

* React.js
* JavaScript (ES6+)
* HTML5
* CSS3
* Fetch API

### Backend

* ServiceNow Platform
* Scripted REST APIs
* GlideRecord API
* Business Rules
* Number Maintenance
* Access Control Lists (ACLs)
* Reference Fields
* Choice Fields
* Dictionary Configuration
* User Roles & Groups
* Authentication & Authorization

### AI Integration

* Groq API
* Llama Model

---

# 🏢 ServiceNow Implementation

This project is designed and implemented entirely on the **ServiceNow Platform** using enterprise development practices.

### ServiceNow Components Used

* Custom Scoped Application
* Custom Tables
* Scripted REST APIs
* GlideRecord
* GlideSystem (gs)
* Business Rules
* Access Control Lists (ACLs)
* Number Maintenance
* User Roles
* User Groups
* Reference Fields
* Choice Lists
* Dictionary Configuration
* Record Producers
* Form Layouts
* Related Lists
* Application Menus
* Modules
* Navigation
* REST API Explorer
* Table Relationships
* Auto-generated Record Numbers

---

# 📂 Modules

* District Management
* District Admin Management
* Farm Management
* Animal Batch Management
* Vaccination Management
* Disease Reporting
* Biosecurity Checklist
* Notification Management
* Incident Management
* AI Disease Analysis
* User Authentication

---

# 🗄️ Database Tables

* u_district
* u_district_admin
* u_farm
* u_animal_batch
* u_vaccination
* u_disease_report
* u_biosecurity_checklist
* u_notification
* u_incident

---

# 👥 User Roles

| Role             | Description                            |
| ---------------- | -------------------------------------- |
| u_farmer         | Manages own farms and livestock        |
| u_district_admin | Manages farms within assigned district |
| u_authority      | Complete system administration         |

---

# 🔒 Security

* Role-Based Access Control (ACLs)
* Table-Level Security
* Record-Level Security
* Field-Level Security
* Scripted ACLs
* Basic Authentication
* Secure REST APIs
* User-based Data Isolation

---

# 🤖 AI Features

* AI-powered Disease Analysis
* Livestock Health Recommendations
* Smart Disease Diagnosis
* Groq Llama Model Integration

---

# 🔔 Notification System

* Farmer Notifications
* District Admin Notifications
* Authority Notifications
* User-specific Notification Delivery
* Read/Unread Status Tracking

---

# 🚨 Incident Management

* Report Farm Issues
* Vaccination Issues
* Technical Issues
* Account Issues
* Notification Issues
* Incident Status Tracking
* Resolution Workflow

---

# 💉 Vaccination Management

* Vaccination Scheduling
* Vaccination Records
* Due Date Tracking
* Status Monitoring

---

# 📡 REST APIs

The platform provides secure Scripted REST APIs for:

* Authentication
* Farm Management
* Animal Batch Management
* Vaccination Management
* Disease Reporting
* AI Disease Analysis
* Notifications
* Incident Management
* District Management
* District Admin Management
* Biosecurity Checklist

---

# 📁 Project Structure

```text
AI-Digital-Farm-Management-Portal/
│
├── Farmer/
├── admin/
├── authority_admin/
├── server/
├── Screen recordings/
├── README.md
└── package.json
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/<your-username>/AI-Farm-Management-Portal.git
```

Navigate to the project

```bash
cd AI-Farm-Management-Portal
```

Install dependencies

```bash
npm install
```

Run the application

```bash
npm start
```

---

# 📸 Demo

The repository includes demonstration videos showcasing:

* Farmer Module
* District Admin Module
* Authority Admin Module

---

# ⭐ Key Highlights

* Enterprise ServiceNow Application
* React Frontend with REST API Integration
* Custom Scoped Application Development
* Scripted REST API Architecture
* Secure Role-Based Access Control (ACLs)
* Business Rules & Number Maintenance
* AI-powered Disease Analysis
* Multi-role Workflow Management
* Incident & Notification Management
* Livestock Vaccination Tracking
* District-wise Farm Administration
* Real-world Enterprise Solution

---

# 👨‍💻 Author

**Balam Praveen Kumar**

---

# 📄 License

This project is developed for educational purposes and to demonstrate enterprise application development using **ServiceNow**, **React**, and **AI Integration**.
