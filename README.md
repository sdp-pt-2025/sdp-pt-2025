<<<<<<< HEAD
# Software Design project (Part-time) 2025

## Table of Contents
- [Naming Conventions](#naming-conventions)
  - [Git and GitHub](#git-and-github)
  - [Files](#files)
  - [Directories](#directories)
  - [Variables](#variables)
  - [Functions](#functions)
  - [Backend Routes](#backend-routes)
  - [Database](#database)
- [Source Code Management]
- 
- [Development Guide](#development-guide)
- [Git Methodology](#git-methodology)
- [Project Management Methodology](#project-management-methodology)
- [Technology Stack](#technology-stack)


## Source Control Management

### Git Itself: The Stupid Content Tracker
For this project, we have chosen **Git** as our source control system. Git, famously described by Linus Torvalds as *“the stupid content tracker”*, is a **non-linear, distributed, and fast** version control system. Unlike older centralized systems, Git tracks snapshots of the entire project rather than just individual file changes. This design enables:

- **Non-linear development** – branches and merges are cheap and easy, allowing parallel work on features or fixes.
- **Distributed workflow** – every developer has a full local copy of the repository, including complete history.
- **Speed** – operations like commits, diffs, and merges are extremely fast.

Other VCS alternatives exist, including Mercurial, Subversion, and Fossil. While functional, these systems are less widely adopted in modern open-source and enterprise projects. We chose Git not only for its **technical advantages** but also for its **wide adoption**, ensuring a large community, extensive documentation, and seamless compatibility with most tools and services. This makes Git the ideal choice for collaboration, maintainability, and long-term project support.

---

### Git is Non-Opinionated
Git itself is **non-opinionated**, meaning it does not enforce rules on:

- How commits are structured
- How branches are named
- How versions are tracked
- How the repository is organized

This flexibility is powerful but can lead to **inconsistent workflows, messy commit history, and technical debt** if left unchecked.

To maintain clarity and prevent code rot, we have **imposed our own structured conventions**:

- **Commit message conventions** – using **Conventional Commits**
- **Branching strategy** – adopting **GitHub Flow** with clear naming conventions
- **Versioning rules** – following **Semantic Versioning (SemVer)**
- **Workflow standards** – defining consistent processes for features, fixes, and releases

By adding this “opinionation,” we ensure that Git’s flexibility becomes a strength rather than a source of confusion.

---

### Using Git Well: Commit Messages
For commit messages, we follow the **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard**, which enforces **machine-readable, consistent, and meaningful messages**.

**Key rules:**

- Write in **imperative present tense** (e.g., “fix bug” instead of “fixed bug”)
- Describe **what changed, not why**
- Make each commit **atomic** – one logical change per commit

**Commit types we use for this project include:**

| Type       | Purpose                                         | Example                                     |
|------------|-------------------------------------------------|---------------------------------------------|
| **feat**   | Add a new feature                               | `feat: implement user authentication`      |
| **fix**    | Fix a bug                                      | `fix: correct validation logic for email input` |
| **docs**   | Documentation updates                           | `docs: update README with setup instructions` |
| **style**  | Formatting changes (no logic changes)          | `style: apply consistent code indentation` |
| **refactor** | Code improvements without changing behavior  | `refactor: simplify API request handling`  |
| **perf**   | Performance improvements                        | `perf: optimize image loading`             |
| **test**   | Add or update tests                             | `test: add unit tests for login module`    |
| **chore**  | Maintenance tasks                               | `chore: update project dependencies`       |
| **remove** | Remove files or code                             | `remove: delete temporary debug script`    |

**Example commits from the project:**

feat: add search functionality to product page
fix(#42): correct misalignment on navbar
docs: add API usage example to README
style: reformat App.js for consistent indentation
refactor: simplify payment validation logic

## References

- Git Kernel Patches
- Conventional Commits
- Brendan Griffiths, Lecture 4
- Branching Strategy

---

### Branching Strategy
We use **GitHub Flow** as our branching methodology because it supports short-lived feature/fix branches, continuous integration, and rapid deployment cycles, aligning with our project’s iterative workflow.

**Branching conventions we follow:**

- **Always existing branches:** `main`, `release`, `stable`
- **Feature/fix branches:**
- 
<type>/<developer>
sprint-<i>/ticket-<j>
<developer>

Where `<type>` can be `feature` or `fix`.  

This structure allows developers to work independently while keeping the repository organized, simplifies pull requests and reviews, and maintains traceability between features, fixes, and the responsible developers.

### Versioning
We follow **Semantic Versioning (SemVer)** to manage releases consistently:

- **Format:** `x.y.z` → `major.minor.patch`
- **x (major):** backward-incompatible changes
- **y (minor):** backward-compatible new features
- **z (patch):** bug fixes

Alternative schemes like **Calendar Versioning (CalVer)** were considered, but SemVer was chosen for its clarity and compatibility with standard tooling.

**Example version updates:**
1.15.2 → 1.16.0  (minor feature added)
1.21.7 → 1.21.8  (patch/fix applied)

Reference: [SemVer.org](https://semver.org/)

### Consistency is Key
Throughout this project, we recognize that **consistency is more important than any specific tool or workflow**. By following structured commit messages, branch naming, GitHub Flow, and SemVer:

- We keep identifiers, branches, and commits predictable.
- We maintain a clean, traceable history.
- We reduce the risk of technical debt and code rot.

This approach ensures Git’s non-opinionated flexibility is leveraged as a **strength**, while our team-imposed conventions maintain order, clarity, and maintainability.

## Project Methodology and Management

### Agile Methodology
For this project, we have adopted **Agile methodology** to ensure flexibility, iterative development, and continuous feedback. Agile allows our team to:

- Break work into manageable units (sprints) to deliver features incrementally.
- Respond quickly to changes in requirements or priorities.
- Collaborate closely with stakeholders and team members for continuous improvement.
- Maintain high transparency and visibility of progress through regular stand-ups, sprint planning, and reviews.

Using Agile ensures that we can adapt to new insights or changes while maintaining focus on delivering a high-quality, functional product.

---

### GitHub Projects for Project Management
To manage tasks, track progress, and maintain visibility of work items, we use **GitHub Projects**. This tool allows us to:

- Organize tasks using **issues** and **cards** on Kanban-style boards.
- Link branches, pull requests, and commits to specific tasks for traceability.
- Track sprint progress and identify blockers quickly.
- Prioritize work and assign tasks to individual developers efficiently.

By integrating **GitHub Projects** with our Git workflow, we maintain a **single source of truth** for both code and project management, ensuring the team remains aligned and accountable throughout the development lifecycle.

=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
>>>>>>> b1279fa (Initialize project using Create React App)
