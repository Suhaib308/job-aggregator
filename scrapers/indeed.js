const { chromium } = require("playwright");
const scoreJob = require("../utils/scoring");
const config = require("../config");

async function scrapeIndeed(searchUrl) {
    let browser;

    try {
        browser = await chromium.launch({
            headless: false,
            slowMo: 100
        });

        const allJobs = [];
        const RESULTS_PER_PAGE = 10;

        for (let pageIndex = 0; pageIndex < config.maxPages; pageIndex++) {
            const start = pageIndex * RESULTS_PER_PAGE;
            const pagedUrl = `${searchUrl}&start=${start}`;

            console.log(`Scraping page ${pageIndex + 1}: ${pagedUrl}`);

            // ✅ NEW: fresh context for every page
            const context = await browser.newContext({
                viewport: { width: 1280, height: 800 },
                userAgent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            });

            const page = await context.newPage();

            try {
                await page.goto(pagedUrl, {
                    waitUntil: "domcontentloaded",
                    timeout: 60000
                });

                // Human pacing
                await page.waitForTimeout(6000 + Math.random() * 4000);

                // Basic Cloudflare detection
                if (await page.locator("text=Checking your browser").count()) {
                    console.warn("Cloudflare detected — stopping pagination.");
                    await context.close();
                    break;
                }

                await page.waitForSelector('a[aria-label*="full details"]', {
                    timeout: 20000
                });

                const jobs = await page.evaluate(() => {
                    const links = document.querySelectorAll(
                        'a[aria-label*="full details"]'
                    );

                    return Array.from(links).map(link => {
                        try {
                            const card = link.closest("div.job_seen_beacon");
                            const jobKey = link.getAttribute("data-jk");

                            let location =
                                card?.querySelector('[data-testid="text-location"]')
                                    ?.innerText || "";
                            location = location
                                .replace(/^Hybrid work in /, "")
                                .trim();

                            let company =
                                card?.querySelector('[data-testid="company-name"]')
                                    ?.innerText || "";

                            // Salary
                            let salary =
                                card?.querySelector(
                                    'li[data-testid*="salary-snippet-container"]'
                                )?.innerText || "";

                            salary = salary.replace(/\s+/g, " ").trim();

                            return {
                                title: link.innerText.trim(),
                                company,
                                location,
                                salary,
                                link: jobKey
                                    ? `https://uk.indeed.com/viewjob?jk=${jobKey}`
                                    : link.href,
                                jobKey
                            };

                        } catch {
                            return null;
                        }
                    }).filter(Boolean);
                });

                if (jobs.length === 0) {
                    console.log("No jobs extracted, stopping pagination.");
                    await context.close();
                    break;
                }

                allJobs.push(...jobs);

            } catch (pageErr) {
                console.warn("Page failed, stopping pagination:", pageErr);
                await context.close();
                break;
            }

            // ✅ Always close context (VERY IMPORTANT)
            await context.close();

            // Cooldown between pages
            await new Promise(resolve =>
                setTimeout(resolve, 8000 + Math.random() * 6000)
            );

        }

        // ✅ Deduplicate by jobKey
        const uniqueJobs = Array.from(
            new Map(allJobs.map(job => [job.jobKey, job])).values()
        );

        // ✅ Score + metadata
        uniqueJobs.forEach(job => {
            try {
                job.score = scoreJob(job);
                job.scraped_at = new Date().toISOString();
                job.source = "Indeed UK";
            } catch (metaErr) {
                console.warn("Failed to score job:", metaErr);
            }
        });

        console.log(`Final jobs count: ${uniqueJobs.length}`);
        return uniqueJobs;

    } catch (err) {
        console.error("Unexpected error in scrapeIndeed:", err);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = scrapeIndeed;
