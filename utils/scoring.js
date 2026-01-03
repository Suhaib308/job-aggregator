function scoreJob(job) {
    let score = 0;

    const title = job.title?.toLowerCase() || "";
    const location = job.location?.toLowerCase() || "";
    const company = job.company?.toLowerCase() || "";
    const salary = job.salary || "";

    // 🔹 Title relevance
    if (title.includes("engineer")) score += 2;
    if (title.includes("senior")) score += 1;
    if (title.includes("lead")) score += 1;
    if (title.includes("graduate") || title.includes("junior")) score -= 1;

    // 🔹 Salary signal (huge value)
    if (salary) score += 2;
    if (salary.includes("£") && salary.includes("year")) score += 1;

    // 🔹 Location quality
    if (location.includes("remote")) score += 2;
    if (location.includes("hybrid")) score += 1;

    // 🔹 Company presence
    if (company.length > 3) score += 1;

    return score;
}

module.exports = scoreJob;
