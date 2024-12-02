# Hwins

## Overview

"Hwins" is my submission to the [Brainrot Hackathon](https://brainrot-jia-seed-hackathon.devpost.com/) for the cvrve track.

This project is a winning hackathon project aggregator, showcasing innovative solutions developed during various hackathons. It consists of a web application that allows users to explore, filter, and search through a collection of winning projects, complete with the demo video, awards won, a project feature list, and creator information.

The project is built using React and integrates with Firebase for data storage and retrieval. It also utilizes Puppeteer for web scraping to gather project data from Devpost.

## Features

- **Filtering Options**: Users can filter projects by categories such as Social Good, Machine Learning, Education, and more.
- **Sorting**: Projects can be sorted by alphabetical order or by the most recent submissions.
- **Project Details**: Each project card displays essential information, including project name, awards won, hackathon entered, features, and creators.
- **Responsive Design**: The application is designed to be mobile-friendly, ensuring a seamless experience across devices.

## File Descriptions

- **app/page.js**: The main application file that handles project fetching, filtering, and rendering.
- **components/custom/FilterModal.js**: A modal component for selecting project categories to filter the displayed projects.
- **components/custom/ProjectCard.js**: A component that displays individual project details in an expanded card view.
- **firebase.js**: Configuration file for Firebase, handling database interactions.
- **stealth_scraper.js**: Script for scraping single project data from Devpost using Puppeteer.
- **multi_project_scraper.js**: Script for scraping multiple projects in a batch process.

## Dependencies

- **React**: For building the user interface.
- **Firebase**: For data storage and authentication.
- **Puppeteer**: For web scraping project data from Devpost.
- **Lucide-react**: For icons used in the application.
- **Next.js**: For server-side rendering and routing.
- **Tailwind CSS**: For styling the application.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.
