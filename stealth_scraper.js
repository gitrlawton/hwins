import "dotenv/config";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { writeProjectToFirestore } from "./firebase.js";

// Add stealth plugin
puppeteerExtra.use(stealthPlugin());

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeProject(url) {
  const browser = await puppeteerExtra.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  try {
    console.time("Total Scrape Time");
    console.log(`Starting scrape for URL: ${url}`);

    const page = await browser.newPage();

    // Improved navigation settings
    await page.setDefaultNavigationTimeout(30000); // Increase timeout to 30 seconds
    await page.setDefaultTimeout(30000);

    // Random delay before navigation
    await delay(Math.random() * 2000 + 1000);

    console.log("Navigating to page...");
    try {
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });
    } catch (navError) {
      console.error("Navigation error:", navError);
      throw navError;
    }

    console.log("Page loaded, waiting for selectors...");

    // Wait for network to be idle and key selectors to be present
    await page.waitForSelector("h1#app-title", { timeout: 15000 });

    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(2000);

    const projectData = await page.evaluate((pageUrl) => {
      // Project Name
      const projectName =
        document.querySelector("h1#app-title")?.textContent.trim() ||
        document.querySelector('[id^="app-title"]')?.textContent.trim() ||
        "";

      // Log Line
      const logLine =
        document.querySelector("p.large")?.textContent.trim() ||
        Array.from(document.querySelectorAll("p"))
          .find((p) => p.classList.contains("large"))
          ?.textContent.trim() ||
        "";

      // Hackathon Name
      const hackathonName =
        document
          .querySelector(
            ".software-list-with-thumbnail .software-list-content p a"
          )
          ?.textContent.trim() ||
        document
          .querySelector(".software-list-content a")
          ?.textContent.trim() ||
        "";

      // Video URL
      const videoIframe = document.querySelector('iframe[src*="youtube.com"]');
      const videoUrl = videoIframe
        ? "https://youtube.com/watch?v=" +
          videoIframe.src.split("/").pop().split("?")[0]
        : null;

      // Fields Won
      const fieldsWon = Array.from(
        new Set(
          Array.from(
            document.querySelectorAll(
              ".software-list-content ul.no-bullet li, .software-list-content .winner"
            )
          )
            .map((el) => el.textContent.trim())
            .filter((text) => text)
            .map(
              (text) =>
                text
                  .replace(/^Winner\s*/, "") // Remove "Winner" prefix
                  .replace(/\n/g, " ") // Replace newlines with spaces
                  .trim() // Remove extra whitespace
            )
            .filter((text) => text !== "") // Remove empty strings
        )
      );

      // Tech Stack
      const techStack = Array.from(
        new Set(
          Array.from(
            document.querySelectorAll(
              "#built-with ul.no-bullet.inline-list li, #built-with .cp-tag"
            )
          )
            .map((el) => el.textContent.trim())
            .filter((text) => text)
        )
      );

      // Creators
      const picContainers = Array.from(
        document.querySelectorAll(".small-2.large-4.columns")
      );
      const nameContainers = Array.from(
        document.querySelectorAll(".small-10.large-8.columns")
      );

      const creators = picContainers
        .map((picContainer, index) => {
          // Profile Picture
          const profilePicture = picContainer.querySelector("img")?.src || "";

          // Name and Profile URL
          const nameContainer = nameContainers[index];
          const nameLink = nameContainer?.querySelector("a");

          const name = nameLink?.textContent.trim() || "";
          const profileUrl = nameLink?.href || "";

          return name
            ? { name, profile_url: profileUrl, profile_picture: profilePicture }
            : null;
        })
        .filter((creator) => creator !== null);

      return {
        post_url: pageUrl,
        project_name: projectName,
        log_line: logLine,
        fields_won: fieldsWon,
        video_url: videoUrl,
        hackathon_name: hackathonName,
        tech_stack: techStack,
        creators: creators,
      };
    }, url);

    await browser.close();
    console.timeEnd("Total Scrape Time");

    console.log(JSON.stringify(projectData, null, 2));
    return projectData;
  } catch (error) {
    console.error("Comprehensive Error Details:");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);

    if (browser) await browser.close();
    throw error;
  }
}

// Test the scraper
const testUrl = "https://devpost.com/software/memory-lanes";

const startTime = Date.now();
console.log(`Process started at: ${new Date(startTime).toISOString()}`);

scrapeProject(testUrl)
  .then(async (projectData) => {
    const scrapeEndTime = Date.now();
    console.log(
      `Scrape completed at: ${new Date(scrapeEndTime).toISOString()}`
    );
    console.log(
      `Scraping duration: ${(scrapeEndTime - startTime) / 1000} seconds`
    );

    const writeStartTime = Date.now();

    // Write to Firestore
    await writeProjectToFirestore(projectData);

    const writeEndTime = Date.now();
    console.log(
      `Database write completed at: ${new Date(writeEndTime).toISOString()}`
    );
    console.log(
      `Database write duration: ${(writeEndTime - writeStartTime) / 1000} seconds`
    );

    const totalEndTime = Date.now();
    console.log(
      `Total process duration: ${(totalEndTime - startTime) / 1000} seconds`
    );

    return projectData;
  })
  .catch((error) => {
    const errorTime = Date.now();
    console.log(`Process failed at: ${new Date(errorTime).toISOString()}`);
    console.log(
      `Total process duration until error: ${(errorTime - startTime) / 1000} seconds`
    );

    console.error("Final Catch Block Error:", error);
    process.exit(1);
  });
