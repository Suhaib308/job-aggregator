function deduplicateJobs(jobs) {
    if (!Array.isArray(jobs)) return [];

    const seen = new Set();
    const unique = [];

    for (const job of jobs) {
        // Normalize title, company, location: trim + lowercase
        const key = `${job.title}|${job.company}|${job.location}`
            .toString()
            .trim()
            .toLowerCase();

        if (!seen.has(key)) {
            seen.add(key);
            unique.push(job);
        }
    }

    return unique;
}

module.exports = deduplicateJobs;
