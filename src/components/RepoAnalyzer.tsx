import React, { useState } from 'react';
import { Github, Search, AlertCircle, Loader2, Link, Sparkles } from 'lucide-react';

interface RepoAnalyzerProps {
  onAnalyze: (url: string) => Promise<void>;
  isAnalyzing: boolean;
  error: string | null;
}

export default function RepoAnalyzer({ onAnalyze, isAnalyzing, error }: RepoAnalyzerProps) {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateGitHubUrl = (url: string): boolean => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+\/?$/;
    return githubRegex.test(url.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    
    if (!validateGitHubUrl(trimmedUrl)) {
      setIsValidUrl(false);
      return;
    }
    
    setIsValidUrl(true);
    await onAnalyze(trimmedUrl);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    if (newUrl && !validateGitHubUrl(newUrl)) {
      setIsValidUrl(false);
    } else {
      setIsValidUrl(true);
    }
  };

  const exampleRepos = [
    'https://github.com/facebook/react',
    'https://github.com/microsoft/vscode',
    'https://github.com/vercel/next.js',
    'https://github.com/tailwindlabs/tailwindcss'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <Github className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyze Repository</h3>
            <p className="text-gray-600">Enter a GitHub repository URL to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link className={`h-5 w-5 ${isValidUrl ? 'text-gray-400' : 'text-red-400'}`} />
                </div>
                <input
                  id="github-url"
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://github.com/username/repository"
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                    isValidUrl 
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                      : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  }`}
                  disabled={isAnalyzing}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isAnalyzing ? (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {!isValidUrl && url && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please enter a valid GitHub repository URL
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !url || !isValidUrl}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Analyzing Repository...
                </>
              ) : (
                <>
                  <Sparkles className="-ml-1 mr-3 h-5 w-5" />
                  Generate README
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Analysis Failed</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Example Repositories */}
      <div className="mt-8">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">Try these example repositories:</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exampleRepos.map((repo, index) => {
            const repoName = repo.split('/').slice(-2).join('/');
            return (
              <button
                key={index}
                onClick={() => setUrl(repo)}
                className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 group"
                disabled={isAnalyzing}
              >
                <div className="flex items-center space-x-2">
                  <Github className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                    {repoName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}