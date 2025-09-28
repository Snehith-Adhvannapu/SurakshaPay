# Rural Banking Cybersecurity Framework

## Overview

This project is a comprehensive cybersecurity framework designed specifically for rural digital banking environments. It addresses the unique challenges of providing secure banking services to underserved communities with limited technology resources and infrastructure constraints.

The application provides fraud detection, secure authentication, device fingerprinting, and offline transaction validation optimized for low-end devices (1-2GB RAM) and poor connectivity scenarios common in rural areas. The system focuses on protecting users from common threats like SIM swapping, phishing attacks, and fraudulent transactions while maintaining accessibility for users with minimal technical literacy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system optimized for rural banking
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Internationalization**: React-i18next supporting 22 Indian languages including regional scripts

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the full stack
- **Database ORM**: Drizzle ORM with PostgreSQL for data persistence
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Security Framework
The application implements multiple layers of security specifically designed for rural banking environments:

- **Fraud Detection ML**: Machine learning-based fraud detection system analyzing transaction patterns, device behavior, and temporal anomalies
- **Device Fingerprinting**: Comprehensive device identification system that tracks hardware specs, network information, and behavioral patterns to detect suspicious devices
- **SIM Swap Detection**: Advanced detection system for SIM card changes using network metadata and carrier information
- **Phishing Protection**: Analysis of SMS patterns and call behavior to detect phishing attempts targeting rural users
- **Agent Behavior Analysis**: Monitoring system for banking agents to detect suspicious transaction patterns
- **Offline Transaction Validation**: Secure offline transaction processing with encryption and validation for areas with poor connectivity
- **Certificate Pinning**: SSL/TLS certificate validation to prevent man-in-the-middle attacks

### Data Architecture
- **User Management**: Comprehensive user profiles with banking details and security preferences
- **Transaction Processing**: Detailed transaction records with fraud scoring and status tracking
- **Device Tracking**: Device fingerprints with trust scores and activity monitoring
- **Security Events**: Comprehensive logging of security incidents and anomalies
- **Fraud Alerts**: Real-time fraud alert system with severity classification

### Design System
- **Accessibility**: Material Design principles adapted for rural users with large touch targets and clear visual indicators
- **Performance**: Ultra-lightweight design optimized for low-end devices
- **Connectivity**: Progressive enhancement for varying connectivity levels
- **Localization**: Support for multiple Indian languages with proper script rendering

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database for all application data using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations and schema management

### Authentication & Security
- **bcrypt**: Password hashing and verification
- **jsonwebtoken**: JWT token generation and validation
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Frontend Libraries
- **React & TypeScript**: Core frontend framework with type safety
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Accessible component primitives for complex UI components
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form handling with validation
- **Wouter**: Lightweight routing solution
- **React-i18next**: Internationalization framework for multi-language support

### Development Tools
- **Vite**: Build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking and compilation
- **PostCSS**: CSS processing with Autoprefixer

### Fonts & Assets
- **Roboto**: Google Fonts for consistent typography across devices
- **Lucide React**: Icon library for UI components

The application is designed to be deployed on platforms that support Node.js applications with PostgreSQL databases, with specific optimizations for serving rural communities with limited infrastructure.