import { Repository, RepoFile, TechnologyStack } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubApiService {
  private async fetchGitHub(url: string) {
    const response = await fetch(`${GITHUB_API_BASE}${url}`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getRepository(owner: string, repo: string): Promise<Repository> {
    return this.fetchGitHub(`/repos/${owner}/${repo}`);
  }

  async getRepositoryContents(owner: string, repo: string, path: string = ''): Promise<RepoFile[]> {
    return this.fetchGitHub(`/repos/${owner}/${repo}/contents/${path}`);
  }

  async getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    return this.fetchGitHub(`/repos/${owner}/${repo}/languages`);
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    try {
      const response = await this.fetchGitHub(`/repos/${owner}/${repo}/contents/${path}`);
      if (response.content) {
        return atob(response.content.replace(/\n/g, ''));
      }
      throw new Error('File content not available');
    } catch (error) {
      console.warn(`Could not fetch ${path}:`, error);
      return '';
    }
  }

  async analyzeRepository(url: string): Promise<{ repo: Repository; files: RepoFile[]; techStack: TechnologyStack }> {
    const urlParts = this.parseGitHubUrl(url);
    if (!urlParts) {
      throw new Error('Invalid GitHub repository URL');
    }

    const { owner, repo } = urlParts;

    try {
      const [repository, files, languages] = await Promise.all([
        this.getRepository(owner, repo),
        this.getRepositoryContents(owner, repo),
        this.getLanguages(owner, repo)
      ]);

      const techStack = await this.detectTechnologies(owner, repo, files, languages);

      return { repo: repository, files, techStack };
    } catch (error) {
      throw new Error(`Failed to analyze repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (!match) return null;

    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, '')
    };
  }

  private async detectTechnologies(owner: string, repo: string, files: RepoFile[], languages: Record<string, number>): Promise<TechnologyStack> {
    const frameworks: string[] = [];
    const tools: string[] = [];
    const databases: string[] = [];
    const deployment: string[] = [];

    const fileNames = files.map(f => f.name.toLowerCase());
    const filePaths = files.map(f => f.path.toLowerCase());

    // Analyze package.json for Node.js projects
    if (fileNames.includes('package.json')) {
      try {
        const packageContent = await this.getFileContent(owner, repo, 'package.json');
        if (packageContent) {
          const pkg = JSON.parse(packageContent);
          const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
          
          // React ecosystem
          if (allDeps.react) {
            frameworks.push('React');
            if (allDeps.next || allDeps.nextjs) frameworks.push('Next.js');
            if (allDeps.gatsby) frameworks.push('Gatsby');
            if (allDeps['react-native']) frameworks.push('React Native');
          }
          
          // Vue ecosystem
          if (allDeps.vue) {
            frameworks.push('Vue.js');
            if (allDeps.nuxt) frameworks.push('Nuxt.js');
          }
          
          // Angular
          if (allDeps.angular || allDeps['@angular/core']) frameworks.push('Angular');
          
          // Other frameworks
          if (allDeps.svelte) frameworks.push('Svelte');
          if (allDeps.express) frameworks.push('Express.js');
          if (allDeps.fastify) frameworks.push('Fastify');
          if (allDeps['@nestjs/core']) frameworks.push('NestJS');
          if (allDeps.koa) frameworks.push('Koa.js');
          if (allDeps.hapi) frameworks.push('Hapi.js');
          
          // Build tools
          if (allDeps.webpack) tools.push('Webpack');
          if (allDeps.vite) tools.push('Vite');
          if (allDeps.parcel) tools.push('Parcel');
          if (allDeps.rollup) tools.push('Rollup');
          if (allDeps.esbuild) tools.push('ESBuild');
          
          // CSS frameworks
          if (allDeps.tailwindcss) tools.push('Tailwind CSS');
          if (allDeps.bootstrap) tools.push('Bootstrap');
          if (allDeps['@mui/material']) tools.push('Material-UI');
          if (allDeps['antd']) tools.push('Ant Design');
          if (allDeps['styled-components']) tools.push('Styled Components');
          
          // Testing
          if (allDeps.jest) tools.push('Jest');
          if (allDeps.vitest) tools.push('Vitest');
          if (allDeps.mocha) tools.push('Mocha');
          if (allDeps.cypress) tools.push('Cypress');
          if (allDeps.playwright) tools.push('Playwright');
          
          // Databases and ORMs
          if (allDeps.mongoose) databases.push('MongoDB');
          if (allDeps.prisma) databases.push('Prisma');
          if (allDeps.sequelize) databases.push('Sequelize');
          if (allDeps.typeorm) databases.push('TypeORM');
          if (allDeps.mysql2 || allDeps.mysql) databases.push('MySQL');
          if (allDeps.pg) databases.push('PostgreSQL');
          if (allDeps.sqlite3) databases.push('SQLite');
          if (allDeps.redis) databases.push('Redis');
          
          // State management
          if (allDeps.redux) tools.push('Redux');
          if (allDeps.zustand) tools.push('Zustand');
          if (allDeps.mobx) tools.push('MobX');
          
          // TypeScript
          if (allDeps.typescript) tools.push('TypeScript');
        }
      } catch (error) {
        console.warn('Could not parse package.json:', error);
      }
    }

    // Python projects
    if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml') || fileNames.includes('pipfile')) {
      tools.push('pip');
      
      // Try to detect Python frameworks
      try {
        let pythonDeps = '';
        if (fileNames.includes('requirements.txt')) {
          pythonDeps = await this.getFileContent(owner, repo, 'requirements.txt');
        }
        
        if (pythonDeps.includes('django')) frameworks.push('Django');
        if (pythonDeps.includes('flask')) frameworks.push('Flask');
        if (pythonDeps.includes('fastapi')) frameworks.push('FastAPI');
        if (pythonDeps.includes('streamlit')) frameworks.push('Streamlit');
        if (pythonDeps.includes('pandas')) tools.push('Pandas');
        if (pythonDeps.includes('numpy')) tools.push('NumPy');
        if (pythonDeps.includes('tensorflow')) frameworks.push('TensorFlow');
        if (pythonDeps.includes('pytorch')) frameworks.push('PyTorch');
      } catch (error) {
        console.warn('Could not analyze Python dependencies:', error);
      }
    }

    // Java projects
    if (fileNames.includes('pom.xml')) {
      tools.push('Maven');
      frameworks.push('Java');
    }
    if (fileNames.includes('build.gradle')) {
      tools.push('Gradle');
      frameworks.push('Java');
    }

    // .NET projects
    if (files.some(f => f.name.endsWith('.csproj') || f.name.endsWith('.sln'))) {
      frameworks.push('.NET');
    }

    // Go projects
    if (fileNames.includes('go.mod')) {
      frameworks.push('Go');
    }

    // Rust projects
    if (fileNames.includes('cargo.toml')) {
      frameworks.push('Rust');
      tools.push('Cargo');
    }

    // Docker
    if (fileNames.includes('dockerfile') || fileNames.includes('docker-compose.yml') || fileNames.includes('docker-compose.yaml')) {
      deployment.push('Docker');
    }

    // CI/CD
    if (files.some(f => f.path.includes('.github/workflows'))) {
      deployment.push('GitHub Actions');
    }
    if (fileNames.includes('.travis.yml')) deployment.push('Travis CI');
    if (fileNames.includes('jenkinsfile')) deployment.push('Jenkins');
    if (fileNames.includes('.gitlab-ci.yml')) deployment.push('GitLab CI');

    // Configuration files
    if (fileNames.includes('tsconfig.json')) tools.push('TypeScript');
    if (fileNames.includes('tailwind.config.js') || fileNames.includes('tailwind.config.ts')) tools.push('Tailwind CSS');
    if (fileNames.includes('next.config.js')) frameworks.push('Next.js');
    if (fileNames.includes('nuxt.config.js')) frameworks.push('Nuxt.js');
    if (fileNames.includes('vue.config.js')) frameworks.push('Vue.js');
    if (fileNames.includes('angular.json')) frameworks.push('Angular');

    // Database files
    if (files.some(f => f.name.endsWith('.sql'))) databases.push('SQL');
    if (fileNames.includes('schema.prisma')) databases.push('Prisma');

    // Remove duplicates and return
    return {
      languages,
      frameworks: [...new Set(frameworks)],
      tools: [...new Set(tools)],
      databases: [...new Set(databases)],
      deployment: [...new Set(deployment)]
    };
  }
}