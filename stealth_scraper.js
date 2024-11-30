import "dotenv/config";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import OpenAI from "openai";
import dotenv from "dotenv";
import { writeProjectToFirestore } from "./firebase.js";

// Add stealth plugin
puppeteerExtra.use(stealthPlugin());

dotenv.config();

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractProjectFeatures(whatItDoesText, inspirationText = null) {
  const useInspirationText = whatItDoesText.length < 300 && inspirationText;

  const prompt = `You will extract key features from a project description. 

  Example:
  Project Description: Memory Lanes is an app that allows you to explore real-life stories from people in your city. When you visit the website, you’ll see a map with story points. By clicking on a point, you can view details about the storyteller and their location. Once you get there, scan a QR code to access their story, which includes their name, age, and a short description. You can listen to the story in audio or read subtitles in German or English. If you're interested in meeting the storyteller in person, you can request a meetup. Once enough interest is shown, volunteers organize in-person connections. 

  Extracted Features:  ["Story-based exploration of real-life experiences through interactive map", "QR code-triggered audio stories with subtitles", "In-person meetup requests with volunteer-organized connections"]

  Now, extract features for this project:

  ${whatItDoesText}
  ${useInspirationText ? `\nAdditional Context:\n${inspirationText}` : ""}

  Guidelines:
  - Extract 3-5 concise, distinct features
  - Focus on unique and innovative aspects
  - Use clear, brief language
  - Each feature MUST be wrapped in double quotes and separated by commas
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

    // Log the full raw response to stderr
    console.error(
      "Full AI Response for Features:",
      response.choices[0].message.content
    );

    const rawResponse = response.choices[0].message.content.trim();

    // Split at the first colon and take the part after it
    const cleanedResponse = rawResponse.includes(":")
      ? rawResponse.split(":")[1].trim()
      : rawResponse;

    // Remove common AI response prefixes
    const finalResponse = cleanedResponse
      .replace(
        /^(Here\s*(are|is)\s*(the\s*)?(extracted\s*)?features?:?\s*)/i,
        ""
      )
      .replace(/^(Features:?\s*)/i, "")
      .replace(/^(Here\s*are\s*the\s*features\s*for\s*.*:?\s*)/i, "")
      .trim();

    // Split and clean features using regex that respects quotes
    const matches = finalResponse.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g); // Match quoted strings or non-comma content
    console.error("Raw matches before filtering:", matches);

    const extractedFeatures = matches
      .map((feature) => feature.trim().replace(/^"|"$/g, "")) // Remove quotes
      .filter(
        (feature) =>
          feature &&
          feature.length > 2 && // Avoid very short, potentially meaningless features
          !feature.match(/^(here|features|are|is|the)$/i) // Additional filter for remnant words
      );

    return extractedFeatures;
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
    "AR/VR",
    "IoT",
    "DevOps",
    "Cybersecurity",
    "Lifehacks",
    "E-commerce/Retail",
    "Voice skills",
    "Music/Art",
    "COVID-19",
    "Robotics",
    "Quantum",
    "Sustainability",
    "Sports/Fitness",
    "Hardware",
  ];

  const prompt = `Analyze the following project description and inspiration text.  Based on this information, determine the 
  most appropriate tags and list them as a comma-separated list. Example: ["Machine Learning/AI", "Education", "Web"]:

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

    // Log the full raw response to stderr
    // console.error(
    //   "Full AI Response for Tags:",
    //   response.choices[0].message.content
    // );

    // Extract just the tags, removing any extra text
    const rawResponse = response.choices[0].message.content.trim();

    // New parsing strategy
    const tagsMatch = rawResponse.match(/(?:^.*?:\s*)?([^:\n]+)$/);
    const extractedTags = tagsMatch
      ? tagsMatch[1]
          .replace(/^\[|\]$/g, "") // Remove square brackets if present
          .split(",")
          .map((tag) => tag.trim())
          .filter(
            (tag) =>
              tag &&
              tag !== "Here are the most appropriate tags for the project"
          ) // Remove empty tags and unwanted text
      : [];
    return extractedTags;
  } catch (error) {
    console.error("Error generating project tags:", error);
    return [];
  }
}

async function scrapeProject(url) {
  const browser = await puppeteerExtra.launch({
    headless: "new",
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  try {
    console.log(`Starting scrape for URL: ${url}`);

    const page = await browser.newPage();

    // Improved navigation settings (synchronous operations)
    page.setDefaultNavigationTimeout(30000); // Increase timeout to 30 seconds
    page.setDefaultTimeout(30000);

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

      // Hackathon Names
      const hackathonNames = Array.from(
        document.querySelectorAll(".software-list-content p")
      )
        .map((p) => p.textContent.trim())
        .filter(
          (text) =>
            text &&
            text.length > 0 &&
            !text.toLowerCase().includes("winner") &&
            !text.toLowerCase().includes("place")
        );

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
      ).find((el) => el.textContent.trim().toLowerCase() === "what it does");

      let whatItDoesText = "";
      if (whatItDoesHeading) {
        let currentElement = whatItDoesHeading.nextElementSibling;
        const nextHeading = Array.from(document.querySelectorAll("h2")).find(
          (el) =>
            el.textContent.trim().toLowerCase() !== "what it does" &&
            el.compareDocumentPosition(whatItDoesHeading) ===
              Node.DOCUMENT_POSITION_PRECEDING
        );

        while (
          currentElement &&
          (!nextHeading ||
            currentElement.compareDocumentPosition(nextHeading) ===
              Node.DOCUMENT_POSITION_FOLLOWING)
        ) {
          if (currentElement.tagName === "P") {
            whatItDoesText += currentElement.textContent.trim() + " ";
          } else if (currentElement.tagName === "UL") {
            whatItDoesText +=
              Array.from(currentElement.querySelectorAll("li"))
                .map((li) => li.textContent.trim())
                .join(" ") + " ";
          }
          currentElement = currentElement.nextElementSibling;
        }
      }

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
        hackathon_names: hackathonNames,
        tech_stack: techStack,
        creators: creators,
      };
    }, url);

    // Features and tags will be extracted in scrapeAndWriteSingleProject
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

async function scrapeAndWriteSingleProject(url) {
  try {
    console.time("Total Scrape Time");

    // Step 1: Scrape the project
    const projectData = await scrapeProject(url);

    // Step 2: Extract project features with timeout
    console.log("Extracting project features...");
    const featuresPromise = extractProjectFeatures(
      projectData.what_it_does_text
    );
    const features = await Promise.race([
      featuresPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Features extraction timed out")),
          10000
        )
      ),
    ]);
    projectData.features = features;

    // Step 3: Generate project tags with timeout
    console.log("Generating project tags...");
    const tagsPromise = generateProjectTags(
      projectData.what_it_does_text,
      projectData.inspiration_text
    );
    const tags = await Promise.race([
      tagsPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Tags generation timed out")), 10000)
      ),
    ]);
    projectData.tags = tags;

    // Step 4: Write to Firestore with timeout
    console.log("Writing project to Firestore...");
    const firestorePromise = writeProjectToFirestore(projectData);
    await Promise.race([
      firestorePromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firestore write timed out")), 10000)
      ),
    ]);

    console.log(
      `Successfully scraped and wrote project: ${projectData.project_name}`
    );

    console.timeEnd("Total Scrape Time");
    return projectData;
  } catch (error) {
    console.error(
      `Detailed error in scrapeAndWriteSingleProject for URL ${url}:`,
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    );
    throw error;
  }
}

// Test function to scrape a single project
async function testScrapeAndWriteSingleProject() {
  const testUrl = "https://devpost.com/software/memory-lanes";

  console.log("Starting test for scrapeAndWriteSingleProject...");
  console.log(`Test URL: ${testUrl}`);

  try {
    console.log("Calling scrapeAndWriteSingleProject...");
    const projectData = await scrapeAndWriteSingleProject(testUrl);

    console.log("Project Data Scraping Test Results:");
    console.log("Project Name:", projectData.project_name);
    console.log(
      "What It Does:",
      projectData.what_it_does_text
        ? projectData.what_it_does_text.substring(0, 200) + "..."
        : "No description"
    );
    console.log("Features:", projectData.features);
    console.log("Tags:", projectData.tags);
    console.log("Post URL:", projectData.post_url);

    return projectData;
  } catch (error) {
    console.error("Error in testScrapeAndWriteSingleProject:", error);
    throw error;
  }
}

// Only run test if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testScrapeAndWriteSingleProject()
    .then(() => {
      console.log("Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

export { scrapeAndWriteSingleProject, testScrapeAndWriteSingleProject };
