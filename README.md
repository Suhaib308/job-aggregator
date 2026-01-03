# Job Aggregator Automation Tool
Automated job data collection tool for JS-heavy job boards.

## Overview
This project automates job listings extraction from Indeed.  
It is designed as a **reusable automation tool**, not a one-off script.  

- Scrapes multiple pages of job listings
- Deduplicates entries
- Scores jobs based on title, position,location, company, and salary
- Generates a **ready-to-use CSV** compatible with Excel/Sheets

---

## Features
- Configurable keyword, location, and number of pages
- Human-like pacing to reduce blocking
- Cloudflare detection handling
- Clickable links in output CSV
- Modular design for adding new sources

---

## Project Structure
job-aggregator/
├── node_modules/ # Node.js project modules
├── scrapers/ # Site-specific scrapers
├── utils/ # Reusable logic (deduplicate, scoring)
├── output/ # CSV outputs (jobs output)
├── config.js # Main configuration
├── index.js # Entry point
├── package.json # Node.js project definition
├── package-lock.json # Node.js project definition
└── README.md # Project description

---

## Installation
1. Clone this repository:
```bash
git clone https://github.com/suhaib308/job-aggregator.git
```
2. Navigate to the project folder:
```bash
cd job-aggregator
```
3. npm install

## Usage

Edit config.js with your preferred keyword and location.

Run the script:
```bash
node index.js
```
## Output

Columns: TITLE | COMPANY | LOCATION | SALARY | LINK | SCORE | SOURCE | SCRAPED_AT

Links are clickable in Excel/Sheets

Scoring helps prioritize relevant jobs

* Note: you can have better view of the content cells by:
clicking on Data → From Text/CSV → go to project file path (/output/jobs.csv) → Import → File Origin (65001: Unicode (UTF-8)) → Transform Data → Close & Load.

## Future Improvements

Add more sources (LinkedIn, Reed, etc.)

Refine scoring with salary normalization

Add CLI options for dynamic keywords/locations

## License

MIT License