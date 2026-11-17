# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React + Vite frontend, Express + MongoDB backend, and a FastAPI scikit-learn prediction service, as specified by the brief.

## Users

Primary users are cafeteria managers and operators who record daily meal activity, plan production for upcoming service, and review food waste.

## Product Purpose

WasteWise helps a single cafeteria reduce avoidable food waste by combining historical meal records, attendance signals, and a trained demand model into actionable preparation recommendations.

## Positioning

The product connects operational record keeping and demand planning in one loop: every saved meal record becomes input for the next explainable prediction and waste review.

## Operating Context

Managers use the dashboard during daily service planning and periodic review. The MVP represents one cafeteria and stores one aggregated record per meal type per day. Synthetic demo data is used for local demonstration and is not evidence of real-world model accuracy.

## Capabilities and Constraints

The system must support meal record CRUD, historical search/filter/sort/pagination, demand prediction, prediction history, waste and consumption analytics, MongoDB persistence, and a Python RandomForestRegressor service. The backend owns leftover calculation, validation, duplicate prevention, date handling, and the 5% planning buffer. The system must not use future information when engineering prediction features.

## Brand Commitments

The product name is WasteWise. The brief commits to a polished SaaS-style analytics interface with an emerald accent, light surfaces, charcoal text, rounded panels, responsive navigation, and charts.

## Evidence on Hand

No real customer data, logos, testimonials, or production accuracy evidence are provided. The repository starts empty; all demo data must be labeled synthetic.

## Product Principles

- Make the next operational decision obvious.
- Keep planning guidance distinct from measured waste.
- Prefer real stored records over hardcoded UI values.
- Keep the full prediction path inspectable from form to model response.
- Surface uncertainty and data limitations honestly.

## Accessibility & Inclusion

The web dashboard should be keyboard navigable, readable at mobile widths, and use explicit labels, focus states, and sufficient contrast.
