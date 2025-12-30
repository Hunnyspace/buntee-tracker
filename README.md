
# BUNTEE – Muska Bun Tracker

A specialized lightweight tracking portal for BUNTEE food stalls.

## Features
- **Daily Entry**: Log Muska Bun sales, tea/extras, and operational costs.
- **Profit Split**: Automated calculations for Owner and Partner shares.
- **Monthly Insights**: Comprehensive table view and aggregated summaries.
- **Role Access**: Simple differentiation between Owner (read/write) and Partner (read-only).

## Deployment Guide

### 1. Firebase Setup
- Enable **Email/Password Auth** in Firebase.
- Enable **Firestore** and set rules to require authentication.
- Create two users: `owner@buntee.com` and `partner@buntee.com`.

### 2. Environment Variables
On your hosting provider (e.g., Netlify), set:
- `API_KEY`: Your Firebase project API Key.

### 3. Build & Publish
- Root directory: `/`
- Build command: None (if using ESM) or `npm run build`
- Publish directory: `.`

## Technical Stack
- **Frontend**: React 19, Tailwind CSS, TypeScript.
- **Backend**: Firebase Firestore, Firebase Auth.
- **Styling**: Brew & Bite themed (Warm Browns, Tans, Creams).
