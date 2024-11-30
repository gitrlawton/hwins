import "dotenv/config";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { writeProjectToFirestore } from "./firebase.js";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// Add stealth plugin
puppeteerExtra.use(stealthPlugin());

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractProjectFeatures(whatItDoesText) {
  const prompt = `You will extract key features from a project description. 

Example:
Project Description: Memory Lanes is an app that allows you to explore real-life stories from people in your city. When you visit the website, you’ll see a map with story points. By clicking on a point, you can view details about the storyteller and their location. Once you get there, scan a QR code to access their story, which includes their name, age, and a short description. You can listen to the story in audio or read subtitles in German or English. If you're interested in meeting the storyteller in person, you can request a meetup. Once enough interest is shown, volunteers organize in-person connections. 

Extracted Features:  Story-based exploration of real-life experiences through interactive map, QR code-triggered audio stories with subtitles, In-person meetup requests with volunteer-organized connections

Now, extract features for this project:

${whatItDoesText}

Guidelines:
- Extract 3-5 concise, distinct features
- Focus on unique and innovative aspects
- Use clear, brief language
- Provide features as a comma-separated list
- Do NOT include any additional text or explanation
- Avoid technical jargon
- Capture the core functionality of the project`;

  try {
    const response = await client.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawResponse = response.choices[0].message.content.trim();

    // Extract the first line (list of features) and split it
    const featuresMatch = rawResponse.match(/^(.*?)(\n|$)/);
    return featuresMatch
      ? featuresMatch[1]
          .split(",")
          .map(
            (feature) =>
              feature.trim().charAt(0).toUpperCase() + feature.trim().slice(1)
          )
      : [];
  } catch (error) {
    console.error("Error extracting project features:", error);
    return [];
  }
}

async function generateProjectTags(whatItDoesText, inspirationText) {
  const predefinedTags = [
    "Social Good",
    "Machine Learning/AI",
    "Education",
    "Low Code/No Code",
    "Web",
    "Blockchain",
    "Productivity",
    "Gaming",
    "Fintech",
    "Mobile",
    "Health",
    "Communication",
    "AR/VR (Augmented Reality/Virtual Reality)",
    "IoT (The Internet of Things)",
    "DevOps",
    "Cybersecurity",
    "Lifehacks",
    "E-commerce/Retail",
    "Voice skills",
    "Music/Art",
    "COVID-19",
    "Robotic Process Automation",
    "Quantum",
  ];

  const prompt = `Analyze the following project description and inspiration text to determine the most appropriate tags:

Project Description: ${whatItDoesText}

Inspiration: ${inspirationText}

Available Tags: ${predefinedTags.join(", ")}

Guidelines:
- Select 3-5 tags that best capture the project's essence
- Consider both technical and social aspects
- Focus on the project's core mission and innovative approach
- Provide ONLY the tags as a comma-separated list
- ONLY use tags from the provided list
- Do NOT include any additional explanation or text`;

  try {
    const response = await client.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract just the tags, removing any extra text
    const rawResponse = response.choices[0].message.content.trim();
    const tagsMatch = rawResponse.match(/^(.*?)(\n|$)/);
    return tagsMatch ? tagsMatch[1].split(",").map((tag) => tag.trim()) : [];
  } catch (error) {
    console.error("Error generating project tags:", error);
    return [];
  }
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

      // Inspiration Text
      const inspirationHeading = Array.from(
        document.querySelectorAll("h2")
      ).find((el) => el.textContent.trim() === "Inspiration");
      const inspirationText = inspirationHeading
        ? inspirationHeading.nextElementSibling?.tagName === "P"
          ? inspirationHeading.nextElementSibling.textContent.trim()
          : null
        : null;

      // What it does Text
      const whatItDoesHeading = Array.from(
        document.querySelectorAll("h2")
      ).find((el) => el.textContent.trim() === "What it does");
      const whatItDoesText = whatItDoesHeading
        ? whatItDoesHeading.nextElementSibling?.tagName === "P"
          ? whatItDoesHeading.nextElementSibling.textContent.trim()
          : null
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
        inspiration_text: inspirationText,
        what_it_does_text: whatItDoesText,
        fields_won: fieldsWon,
        video_url: videoUrl,
        hackathon_name: hackathonName,
        tech_stack: techStack,
        creators: creators,
      };
    }, url);

    const features = await extractProjectFeatures(
      projectData.what_it_does_text
    );
    const tags = await generateProjectTags(
      projectData.what_it_does_text,
      projectData.inspiration_text
    );

    projectData.features = features;
    projectData.tags = tags;

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
