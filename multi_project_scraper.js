import "dotenv/config";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { scrapeAndWriteSingleProject } from "./stealth_scraper.js";

// Add stealth plugin
puppeteerExtra.use(stealthPlugin());

async function scrapeMultipleProjects() {
  console.log("Starting multiple project scraping...");

  try {
    console.log("Launching browser...");
    const browser = await puppeteerExtra.launch({
      headless: "new",
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--window-size=1920,1080",
      ],
    });

    try {
      console.log("Creating new browser page...");
      const page = await browser.newPage();

      // Set viewport and user agent to mimic a real browser
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      console.log("Navigating to search results page...");

      // Navigate to the search results page
      await page.goto(
        "https://devpost.com/software/search?query=is%3Awinner+has%3Avideo",
        {
          waitUntil: "networkidle2",
          timeout: 60000,
        }
      );

      // Wait for the project gallery items to load
      console.log("Waiting for project gallery items...");
      await page.waitForSelector(".large-3.small-12.columns.gallery-item", {
        timeout: 30000,
      });

      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await page.waitForTimeout(2000);

      // Detailed page content extraction for debugging
      const projectItemsDebug = await page.evaluate(() => {
        const projectItems = document.querySelectorAll(
          ".large-3.small-12.columns.gallery-item"
        );
        return Array.from(projectItems).map((item, index) => {
          const link = item.querySelector(
            "a.block-wrapper-link.fade.link-to-software"
          );
          return {
            index: index,
            href: link ? link.href : "No link found",
          };
        });
      });

      console.log("Project Links Debug:");
      console.log(projectItemsDebug.map((item) => item.href));

      // Scrape multiple projects
      const scrapedProjects = [];

      // Select the first 3 project links
      const projectLinks = await page.$$(
        ".block-wrapper-link.fade.link-to-software"
      );

      console.log(`Total project links found: ${projectLinks.length}`);

      // Limit to first 3 projects
      for (let i = 0; i < Math.min(3, projectLinks.length); i++) {
        try {
          console.log(`Attempting to click on project link ${i + 1}`);

          // Get href directly instead of clicking
          const projectUrl = await page.evaluate(
            (el) => el.href,
            projectLinks[i]
          );

          // Log the project URL
          console.log(`=== Scraping Project ${i + 1} ===`);
          console.log(`Project URL: ${projectUrl}`);

          // Extract project name from URL for additional logging
          const projectNameFromUrl = projectUrl.split("/").pop();
          console.log(`Project Name from URL: ${projectNameFromUrl}`);

          // Scrape the project
          console.log("Calling scrapeAndWriteSingleProject...");
          const projectData = await scrapeAndWriteSingleProject(projectUrl);
          console.log(`Successfully scraped: ${projectData.project_name}`);

          // Add to scraped projects
          scrapedProjects.push(projectData);

          // Add a small delay between scrapes to reduce potential rate limiting
          await page.waitForTimeout(2000);
        } catch (error) {
          console.error(`Error processing project link ${i + 1}:`, error);
          console.error("Full error stack:", error.stack);
        }
      }

      console.log(
        "Scraping completed. Total projects:",
        scrapedProjects.length
      );
      return scrapedProjects;
    } catch (error) {
      console.error("Error inside scrapeMultipleProjects:", error);
      throw error;
    } finally {
      console.log("Closing browser...");
      await browser.close();
    }
  } catch (error) {
    console.error("Error launching browser:", error);
    throw error;
  }
}

// Add a test function to call scrapeMultipleProjects directly
async function testScrapeMultipleHardcodedProjects() {
  console.error("Starting test for scraping multiple projects...");

  const urls = [
    "https://devpost.com/software/memory-lanes",
    "https://devpost.com/software/lifeline-bjh9lx",
    "https://devpost.com/software/sparbot-xo7hsi",
  ];

  try {
    // Iterate over each URL and scrape/write the project
    for (const url of urls) {
      console.error(`Attempting to scrape project from URL: ${url}`);

      const projectData = await scrapeAndWriteSingleProject(url);

      console.error(
        "Scraping completed successfully for:",
        projectData.project_name
      );
      console.error("Project Details:");
      console.error("Project Name:", projectData.project_name);
      console.error("Post URL:", projectData.post_url);
      console.error(
        "What It Does:",
        projectData.what_it_does_text
          ? projectData.what_it_does_text.substring(0, 200) + "..."
          : "No description"
      );
      console.error("Features:", projectData.features);
      console.error("Tags:", projectData.tags);
      console.error("----------------------------");
    }

    console.error("Successfully scraped and processed all test projects");
  } catch (error) {
    console.error("Error in testScrapeMultipleProjects:", error);
    throw error;
  }
}

// Add a test function to call scrapeAndWriteSingleProject directly
async function testScrapeAndWriteSingleProject() {
  console.error("Starting test for scrapeAndWriteSingleProject...");

  // Use a sample Devpost project URL
  const testUrl = "https://devpost.com/software/memory-lanes";

  try {
    console.error(`Attempting to scrape project from URL: ${testUrl}`);

    const projectData = await scrapeAndWriteSingleProject(testUrl);

    console.error("Scraping completed successfully");
    console.error("Project Details:");
    console.error("Project Name:", projectData.project_name);
    console.error("Post URL:", projectData.post_url);
    console.error(
      "What It Does:",
      projectData.what_it_does_text
        ? projectData.what_it_does_text.substring(0, 200) + "..."
        : "No description"
    );
    console.error("Features:", projectData.features);
    console.error("Tags:", projectData.tags);

    return projectData;
  } catch (error) {
    console.error("Error in testScrapeAndWriteSingleProject:", error);
    throw error;
  }
}

// Add a test function to call scrapeMultipleProjects directly
async function testScrapeMultipleLiveProjects() {
  console.log("Starting test for scraping multiple live projects...");

  try {
    const projects = await scrapeMultipleProjects();

    console.log("Total projects scraped:", projects.length);
    projects.forEach((project, index) => {
      console.log(`Project ${index + 1}:`, project.project_name);
    });

    return projects;
  } catch (error) {
    console.error("Error scraping multiple live projects:", error);
    throw error;
  }
}

// testScrapeAndWriteSingleProject()
//     .then(() => {
//         console.log('Test completed successfully');
//         process.exit(0);
//     })
//     .catch((error) => {
//         console.error('Test failed:', error);
//         process.exit(1);
//     });

// testScrapeMultipleHardcodedProjects()
//   .then(() => {
//     console.log("Test completed successfully");
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error("Test failed:", error);
//     process.exit(1);
//   });

testScrapeMultipleLiveProjects()
  .then(() => {
    console.log("Test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
