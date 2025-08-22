import { Repository, TechnologyStack, RepoFile } from '../types';

export class ReadmeGenerator {
  generateReadme(repository: Repository, techStack: TechnologyStack, files: RepoFile[]): string {
    const sections: string[] = [];

    // Title and description
    sections.push(this.generateHeader(repository));
    
    // Badges
    sections.push(this.generateBadges(repository, techStack));
    
    // Description with better analysis
    sections.push(this.generateDescription(repository, techStack, files));

    // Table of contents
    sections.push(this.generateTableOfContents(techStack, files));

    // Features based on actual project analysis
    sections.push(this.generateFeatures(repository, techStack, files));

    // Technology stack
    sections.push(this.generateTechStack(techStack));

    // Installation based on detected technologies
    sections.push(this.generateInstallation(techStack, files));

    // Usage based on project type
    sections.push(this.generateUsage(repository, techStack, files));

    // Project structure
    sections.push(this.generateProjectStructure(files));

    // API Documentation (if applicable)
    if (this.shouldIncludeApiDocs(techStack, files)) {
      sections.push(this.generateApiDocs(techStack));
    }

    // Scripts (if package.json exists)
    if (this.hasPackageJson(files)) {
      sections.push(this.generateScripts());
    }

    // Contributing
    sections.push(this.generateContributing());

    // License
    sections.push(this.generateLicense(repository));

    // Contact
    sections.push(this.generateContact(repository));

    return sections.filter(section => section.trim()).join('\n\n');
  }

  private generateHeader(repository: Repository): string {
    const title = repository.name
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return `# ${title}

${repository.description || 'A modern application built with the latest technologies.'}`;
  }

  private generateBadges(repository: Repository, techStack: TechnologyStack): string {
    const badges: string[] = [];

    // GitHub badges
    badges.push(`[![Stars](https://img.shields.io/github/stars/${repository.full_name}?style=for-the-badge&logo=github)](${repository.html_url}/stargazers)`);
    badges.push(`[![Forks](https://img.shields.io/github/forks/${repository.full_name}?style=for-the-badge&logo=github)](${repository.html_url}/network/members)`);
    badges.push(`[![Issues](https://img.shields.io/github/issues/${repository.full_name}?style=for-the-badge&logo=github)](${repository.html_url}/issues)`);

    // Language badge
    if (repository.language) {
      const color = this.getLanguageColor(repository.language);
      badges.push(`[![${repository.language}](https://img.shields.io/badge/${repository.language}-${color}?style=for-the-badge&logo=${repository.language.toLowerCase()})]()`);
    }

    // Framework badges
    techStack.frameworks.forEach(framework => {
      const badge = this.getFrameworkBadge(framework);
      if (badge) badges.push(badge);
    });

    // License badge
    if (repository.license) {
      badges.push(`[![License](https://img.shields.io/badge/License-${repository.license.spdx_id}-green?style=for-the-badge)](LICENSE)`);
    }

    return badges.join('\n');
  }

  private getLanguageColor(language: string): string {
    const colors: Record<string, string> = {
      'JavaScript': 'F7DF1E',
      'TypeScript': '3178C6',
      'Python': '3776AB',
      'Java': 'ED8B00',
      'Go': '00ADD8',
      'Rust': '000000',
      'C++': '00599C',
      'C#': '239120',
      'PHP': '777BB4',
      'Ruby': 'CC342D',
      'Swift': 'FA7343',
      'Kotlin': '0095D5'
    };
    return colors[language] || '000000';
  }

  private getFrameworkBadge(framework: string): string | null {
    const badges: Record<string, string> = {
      'React': '[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()',
      'Next.js': '[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)]()',
      'Vue.js': '[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)]()',
      'Angular': '[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)]()',
      'Express.js': '[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)]()',
      'Django': '[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)]()',
      'Flask': '[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)]()',
      'FastAPI': '[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)]()'
    };
    return badges[framework] || null;
  }

  private generateDescription(repository: Repository, techStack: TechnologyStack, files: RepoFile[]): string {
    let description = `## 📋 About

${repository.description || 'This project showcases modern development practices and technologies.'}

`;

    // Add project type detection
    const projectType = this.detectProjectType(techStack, files);
    if (projectType) {
      description += `**Project Type:** ${projectType}\n\n`;
    }

    // Add creation and update info
    description += `**Created:** ${new Date(repository.created_at).toLocaleDateString()}\n`;
    description += `**Last Updated:** ${new Date(repository.updated_at).toLocaleDateString()}\n`;
    description += `**Repository Size:** ${this.formatBytes(repository.size * 1024)}`;

    return description;
  }

  private detectProjectType(techStack: TechnologyStack, files: RepoFile[]): string | null {
    const fileNames = files.map(f => f.name.toLowerCase());
    
    if (techStack.frameworks.includes('React')) {
      if (techStack.frameworks.includes('Next.js')) return 'Next.js Web Application';
      return 'React Web Application';
    }
    
    if (techStack.frameworks.includes('Vue.js')) {
      if (techStack.frameworks.includes('Nuxt.js')) return 'Nuxt.js Web Application';
      return 'Vue.js Web Application';
    }
    
    if (techStack.frameworks.includes('Angular')) return 'Angular Web Application';
    if (techStack.frameworks.includes('Django')) return 'Django Web Application';
    if (techStack.frameworks.includes('Flask')) return 'Flask Web Application';
    if (techStack.frameworks.includes('Express.js')) return 'Node.js Backend API';
    if (techStack.frameworks.includes('FastAPI')) return 'FastAPI Backend API';
    
    if (fileNames.includes('package.json')) return 'Node.js Application';
    if (fileNames.includes('requirements.txt')) return 'Python Application';
    if (fileNames.includes('pom.xml')) return 'Java Application';
    if (fileNames.includes('cargo.toml')) return 'Rust Application';
    if (fileNames.includes('go.mod')) return 'Go Application';
    
    return null;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateTableOfContents(techStack: TechnologyStack, files: RepoFile[]): string {
    const sections = [
      '- [About](#-about)',
      '- [Features](#-features)',
      '- [Technology Stack](#-technology-stack)',
      '- [Installation](#-installation)',
      '- [Usage](#-usage)',
      '- [Project Structure](#-project-structure)'
    ];

    if (this.shouldIncludeApiDocs(techStack, files)) {
      sections.push('- [API Documentation](#-api-documentation)');
    }

    if (this.hasPackageJson(files)) {
      sections.push('- [Available Scripts](#-available-scripts)');
    }

    sections.push(
      '- [Contributing](#-contributing)',
      '- [License](#-license)',
      '- [Contact](#-contact)'
    );

    return `## 📚 Table of Contents

${sections.join('\n')}`;
  }

  private generateFeatures(repository: Repository, techStack: TechnologyStack, files: RepoFile[]): string {
    const features: string[] = [];
    const fileNames = files.map(f => f.name.toLowerCase());

    // Technology-based features
    if (techStack.frameworks.includes('React')) {
      features.push('⚛️ Built with React for dynamic user interfaces');
      if (techStack.tools.includes('TypeScript')) {
        features.push('📘 Full TypeScript support for type safety');
      }
    }

    if (techStack.frameworks.includes('Next.js')) {
      features.push('🚀 Server-side rendering with Next.js');
      features.push('📱 Optimized for performance and SEO');
    }

    if (techStack.tools.includes('Tailwind CSS')) {
      features.push('🎨 Responsive design with Tailwind CSS');
    }

    if (techStack.frameworks.includes('Express.js')) {
      features.push('🔧 RESTful API with Express.js');
    }

    if (techStack.databases.length > 0) {
      features.push(`🗄️ Database integration with ${techStack.databases.join(', ')}`);
    }

    // File-based features
    if (fileNames.includes('dockerfile')) {
      features.push('🐳 Docker containerization for easy deployment');
    }

    if (files.some(f => f.path.includes('.github/workflows'))) {
      features.push('🔄 Automated CI/CD with GitHub Actions');
    }

    if (fileNames.some(name => name.includes('test') || name.includes('spec'))) {
      features.push('🧪 Comprehensive testing suite');
    }

    if (fileNames.includes('.env.example')) {
      features.push('⚙️ Environment-based configuration');
    }

    // Default features if none detected
    if (features.length === 0) {
      features.push(
        '✨ Modern and clean architecture',
        '⚡ Optimized for performance',
        '🔒 Secure coding practices',
        '📱 Responsive and user-friendly design'
      );
    }

    return `## ✨ Features

${features.map(feature => `${feature}`).join('\n')}`;
  }

  private generateTechStack(techStack: TechnologyStack): string {
    const sections: string[] = [];

    if (Object.keys(techStack.languages).length > 0) {
      const total = Object.values(techStack.languages).reduce((a, b) => a + b, 0);
      const languageList = Object.entries(techStack.languages)
        .sort(([,a], [,b]) => b - a)
        .map(([lang, bytes]) => {
          const percentage = ((bytes / total) * 100).toFixed(1);
          return `- **${lang}** (${percentage}%)`;
        }).join('\n');
      sections.push(`### Programming Languages\n${languageList}`);
    }

    if (techStack.frameworks.length > 0) {
      const frameworkList = techStack.frameworks.map(fw => `- **${fw}**`).join('\n');
      sections.push(`### Frameworks & Libraries\n${frameworkList}`);
    }

    if (techStack.tools.length > 0) {
      const toolsList = techStack.tools.map(tool => `- **${tool}**`).join('\n');
      sections.push(`### Development Tools\n${toolsList}`);
    }

    if (techStack.databases.length > 0) {
      const dbList = techStack.databases.map(db => `- **${db}**`).join('\n');
      sections.push(`### Databases & Storage\n${dbList}`);
    }

    if (techStack.deployment.length > 0) {
      const deployList = techStack.deployment.map(deploy => `- **${deploy}**`).join('\n');
      sections.push(`### Deployment & DevOps\n${deployList}`);
    }

    return `## 🛠 Technology Stack

${sections.join('\n\n')}`;
  }

  private generateInstallation(techStack: TechnologyStack, files: RepoFile[]): string {
    const fileNames = files.map(f => f.name.toLowerCase());
    let installSteps = '';

    // Node.js project
    if (fileNames.includes('package.json')) {
      const packageManager = fileNames.includes('yarn.lock') ? 'yarn' : 
                           fileNames.includes('pnpm-lock.yaml') ? 'pnpm' : 'npm';
      
      installSteps = `### Prerequisites
- Node.js (version 16 or higher)
- ${packageManager} package manager

### Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone ${this.getCloneUrl('REPO_URL')}
   cd ${this.getRepoName('REPO_NAME')}
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   ${packageManager} install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   ${packageManager} run dev
   \`\`\``;
    }
    // Python project
    else if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml')) {
      installSteps = `### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone ${this.getCloneUrl('REPO_URL')}
   cd ${this.getRepoName('REPO_NAME')}
   \`\`\`

2. **Create a virtual environment**
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Run the application**
   \`\`\`bash
   python main.py
   \`\`\``;
    }
    // Java project
    else if (fileNames.includes('pom.xml')) {
      installSteps = `### Prerequisites
- Java 11 or higher
- Maven

### Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone ${this.getCloneUrl('REPO_URL')}
   cd ${this.getRepoName('REPO_NAME')}
   \`\`\`

2. **Build the project**
   \`\`\`bash
   mvn clean install
   \`\`\`

3. **Run the application**
   \`\`\`bash
   mvn spring-boot:run
   \`\`\``;
    }
    // Generic installation
    else {
      installSteps = `### Prerequisites
- Check the technology stack above for specific requirements

### Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone ${this.getCloneUrl('REPO_URL')}
   cd ${this.getRepoName('REPO_NAME')}
   \`\`\`

2. **Follow the setup instructions for your specific technology stack**
   
3. **Configure environment variables if needed**
   
4. **Run the application according to your platform requirements**`;
    }

    return `## 🚀 Installation

${installSteps}`;
  }

  private generateUsage(repository: Repository, techStack: TechnologyStack, files: RepoFile[]): string {
    const fileNames = files.map(f => f.name.toLowerCase());
    let usageContent = '';

    if (fileNames.includes('package.json')) {
      const packageManager = fileNames.includes('yarn.lock') ? 'yarn' : 
                           fileNames.includes('pnpm-lock.yaml') ? 'pnpm' : 'npm';
      
      usageContent = `### Development Mode
\`\`\`bash
${packageManager} run dev
\`\`\`

### Production Build
\`\`\`bash
${packageManager} run build
${packageManager} start
\`\`\`

### Running Tests
\`\`\`bash
${packageManager} test
\`\`\`

### Linting
\`\`\`bash
${packageManager} run lint
\`\`\``;
    } else if (fileNames.includes('requirements.txt')) {
      usageContent = `### Running the Application
\`\`\`bash
python main.py
\`\`\`

### Running Tests
\`\`\`bash
python -m pytest
\`\`\`

### Development Mode
\`\`\`bash
python manage.py runserver  # For Django projects
flask run  # For Flask projects
\`\`\``;
    } else {
      usageContent = `### Basic Usage

After installation, you can start using the application by following these steps:

1. Launch the application using the appropriate command for your environment
2. Access the application through your web browser or terminal
3. Follow the on-screen instructions or refer to the documentation

### Configuration

You can customize the application behavior by modifying the configuration files or environment variables.`;
    }

    return `## 📖 Usage

${usageContent}`;
  }

  private generateProjectStructure(files: RepoFile[]): string {
    const structure = this.buildFileTree(files);
    
    return `## 📁 Project Structure

\`\`\`
${structure}
\`\`\``;
  }

  private buildFileTree(files: RepoFile[]): string {
    const tree: string[] = [];
    const sortedFiles = files.sort((a, b) => {
      // Directories first, then files
      if (a.type === 'dir' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    });

    sortedFiles.forEach((file, index) => {
      const isLast = index === sortedFiles.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      const icon = file.type === 'dir' ? '📁 ' : '📄 ';
      tree.push(`${prefix}${icon}${file.name}`);
    });

    return tree.join('\n');
  }

  private shouldIncludeApiDocs(techStack: TechnologyStack, files: RepoFile[]): boolean {
    const hasApi = techStack.frameworks.some(fw => 
      fw.includes('Express') || fw.includes('Fastify') || fw.includes('NestJS') || 
      fw.includes('Django') || fw.includes('Flask') || fw.includes('FastAPI')
    );
    
    const hasApiFiles = files.some(f => 
      f.name.toLowerCase().includes('api') || 
      f.path.toLowerCase().includes('routes') ||
      f.path.toLowerCase().includes('controllers') ||
      f.path.toLowerCase().includes('endpoints')
    );

    return hasApi || hasApiFiles;
  }

  private generateApiDocs(techStack: TechnologyStack): string {
    const port = techStack.frameworks.includes('Django') ? '8000' : '3000';
    
    return `## 📡 API Documentation

### Base URL
\`\`\`
http://localhost:${port}/api
\`\`\`

### Authentication
Some endpoints may require authentication. Include the authorization header:
\`\`\`bash
Authorization: Bearer <your-token>
\`\`\`

### Common Endpoints

#### Health Check
\`\`\`http
GET /api/health
\`\`\`

**Response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
\`\`\`

For detailed API documentation, please refer to the API documentation or check if Swagger/OpenAPI documentation is available at \`/api/docs\`.`;
  }

  private hasPackageJson(files: RepoFile[]): boolean {
    return files.some(f => f.name.toLowerCase() === 'package.json');
  }

  private generateScripts(): string {
    return `## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Build for production |
| \`npm run start\` | Start production server |
| \`npm run test\` | Run test suite |
| \`npm run lint\` | Run linter |
| \`npm run format\` | Format code |

Run \`npm run\` to see all available scripts.`;
  }

  private generateContributing(): string {
    return `## 🤝 Contributing

We welcome contributions to this project! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Make your changes
4. Commit your changes (\`git commit -m 'Add amazing feature'\`)
5. Push to the branch (\`git push origin feature/amazing-feature\`)
6. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Code of Conduct
Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.`;
  }

  private generateLicense(repository: Repository): string {
    const license = repository.license?.name || 'MIT License';
    const spdxId = repository.license?.spdx_id || 'MIT';
    
    return `## 📄 License

This project is licensed under the ${license} - see the [LICENSE](LICENSE) file for details.

[![License](https://img.shields.io/badge/License-${spdxId}-blue.svg)](LICENSE)`;
  }

  private generateContact(repository: Repository): string {
    const ownerName = repository.full_name.split('/')[0];
    
    return `## 📞 Contact

**Project Maintainer:** [@${ownerName}](https://github.com/${ownerName})

**Project Link:** [${repository.html_url}](${repository.html_url})

### Support
- 🐛 **Bug Reports:** [Issues](${repository.html_url}/issues)
- 💡 **Feature Requests:** [Issues](${repository.html_url}/issues)
- 📧 **Email:** [Contact via GitHub](https://github.com/${ownerName})

### Show your support
Give a ⭐️ if this project helped you!

---

<div align="center">
  Made with ❤️ by the development team
</div>`;
  }

  private getCloneUrl(placeholder: string): string {
    return placeholder; // Will be replaced with actual URL
  }

  private getRepoName(placeholder: string): string {
    return placeholder; // Will be replaced with actual repo name
  }
}