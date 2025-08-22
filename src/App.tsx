import React, { useState } from 'react';
import { Repository, TechnologyStack, RepoFile } from './types';
import RepoAnalyzer from './components/RepoAnalyzer';
import ReadmePreview from './components/ReadmePreview';
import { GitHubApiService } from './services/githubApi';
import { ReadmeGenerator } from './services/readmeGenerator';
import { Github, FileText, Download, Sparkles } from 'lucide-react';

function App() {
  const [repository, setRepository] = useState<Repository | null>(null);
  const [techStack, setTechStack] = useState<TechnologyStack | null>(null);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [generatedReadme, setGeneratedReadme] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const githubService = new GitHubApiService();
  const readmeGenerator = new ReadmeGenerator();

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const { repo, files: repoFiles, techStack: detectedTech } = await githubService.analyzeRepository(url);
      
      setRepository(repo);
      setFiles(repoFiles);
      setTechStack(detectedTech);
      
      // Generate README based on analysis
      const readme = readmeGenerator.generateReadme(repo, detectedTech, repoFiles);
      // Replace placeholders with actual repository information
      const finalReadme = readme
        .replace(/REPO_URL/g, repo.clone_url)
        .replace(/REPO_NAME/g, repo.name);
      setGeneratedReadme(finalReadme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze repository');
      setRepository(null);
      setTechStack(null);
      setFiles([]);
      setGeneratedReadme('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (!generatedReadme) return;
    
    const blob = new Blob([generatedReadme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setRepository(null);
    setTechStack(null);
    setFiles([]);
    setGeneratedReadme('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Github className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">README Generator</h1>
                <p className="text-sm text-gray-600">AI-powered GitHub documentation</p>
              </div>
            </div>
            
            {generatedReadme && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  New Project
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!repository && (
        <div className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Generate Professional READMEs
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Automatically
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Analyze your GitHub repository and generate comprehensive, professional documentation 
              with technology detection and smart templates.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {!repository ? (
          <RepoAnalyzer onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} error={error} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Repository Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <Github className="h-6 w-6 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">Repository Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{repository.name}</h4>
                    <p className="text-sm text-gray-600">{repository.description || 'No description available'}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium">
                      ⭐ {repository.stargazers_count}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md font-medium">
                      🍴 {repository.forks_count}
                    </span>
                    {repository.language && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md font-medium">
                        {repository.language}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              {techStack && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Stack</h3>
                  
                  <div className="space-y-4">
                    {Object.keys(techStack.languages).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Languages</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(techStack.languages).map(([lang, bytes]) => (
                            <span key={lang} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {techStack.frameworks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Frameworks</h4>
                        <div className="flex flex-wrap gap-1">
                          {techStack.frameworks.map(framework => (
                            <span key={framework} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                              {framework}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {techStack.tools.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Tools</h4>
                        <div className="flex flex-wrap gap-1">
                          {techStack.tools.map(tool => (
                            <span key={tool} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* README Preview */}
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)]">
              <ReadmePreview content={generatedReadme} repository={repository} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;