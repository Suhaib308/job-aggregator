const scrapeIndeed = require("./scrapers/indeed");
const deduplicateJobs = require("./utils/deduplicate");
const { createObjectCsvWriter } = require("csv-writer");
const config = require("./config");

// CSV writer configuration
const csvWriter = createObjectCsvWriter({
    path: config.outputFile,
    header: [
        { id: "title", title: "TITLE" },
        { id: "company", title: "COMPANY" },
        { id: "location", title: "LOCATION" },
        { id: "salary", title: "SALARY" },
        { id: "link", title: "LINK" },
        { id: "score", title: "SCORE" },
        { id: "source", title: "SOURCE" },
        { id: "scraped_at", title: "SCRAPED_AT" }
    ]
});

(async () => {
    try {
        const url = `https://uk.indeed.com/jobs?q=${config.keyword}&l=${config.location}`;

        // Scrape jobs
        const jobs = await scrapeIndeed(url);
        console.log("Extracted:", jobs.length);

        // Deduplicate
        const uniqueJobs = deduplicateJobs(jobs);
        console.log("Unique:", uniqueJobs.length);

        // Make links clickable for Excel/Sheets by wrapping in =HYPERLINK()
        const jobsWithClickableLinks = uniqueJobs.map(job => ({
            ...job,
            link: `=HYPERLINK("${job.link}", "${job.link}")`
        }));

        // Write to CSV
        await csvWriter.writeRecords(jobsWithClickableLinks);
        console.log(`CSV saved to ${config.outputFile}`);

        // Preview first 5 jobs in console
        console.table(jobsWithClickableLinks.slice(0, 5));
    } catch (err) {
        console.error("Error in index.js:", err);
    }
})();
