import React, { useState } from 'react';
import { Search, FileText, TrendingUp, Award, Briefcase, Copy, CheckCircle, Settings, Zap, Brain, Moon, Sun, LogIn } from 'lucide-react';

const PlsGetMeAJobAI = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [keywords, setKeywords] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedSection, setCopiedSection] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedLLM, setSelectedLLM] = useState('anthropic'); // Default to Claude
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode by adding/removing 'dark' class on html
  React.useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  // Pre-built finance keyword database
  const financeKeywordDatabase = {
    highPriorityTerms: [
      'financial modeling', 'investment banking', 'mergers and acquisitions', 'm&a', 'due diligence',
      'valuation', 'dcf', 'lbo', 'leveraged buyout', 'discounted cash flow', 'pitch deck',
      'client management', 'relationship management', 'deal execution', 'transaction advisory',
      'capital markets', 'equity research', 'debt financing', 'credit analysis', 'risk management'
    ],
    technicalSkills: [
      'excel', 'powerpoint', 'bloomberg', 'capital iq', 'factset', 'refinitiv', 'sql', 'python',
      'tableau', 'power bi', 'vba', 'financial modeling', 'monte carlo', 'scenario analysis',
      'sensitivity analysis', 'regression analysis', 'financial statements', 'gaap', 'ifrs'
    ],
    softSkills: [
      'leadership', 'communication', 'problem solving', 'analytical thinking', 'team collaboration',
      'client service', 'attention to detail', 'time management', 'multitasking', 'presentation skills',
      'negotiation', 'critical thinking', 'adaptability', 'project management'
    ],
    industryTerms: [
      'big 4', 'bulge bracket', 'boutique', 'sell side', 'buy side', 'front office', 'back office',
      'middle office', 'ibd', 'investment banking division', 'sales and trading', 's&t',
      'asset management', 'wealth management', 'private equity', 'pe', 'venture capital', 'vc',
      'hedge fund', 'mutual fund', 'etf', 'derivatives', 'fixed income', 'equities', 'commodities',
      'forex', 'fx', 'treasury', 'corporate finance', 'restructuring', 'distressed', 'ipo',
      'secondary offering', 'rights offering', 'spin off', 'carve out', 'joint venture'
    ],
    actionVerbs: [
      'executed', 'analyzed', 'managed', 'developed', 'structured', 'advised', 'coordinated',
      'facilitated', 'negotiated', 'implemented', 'optimized', 'streamlined', 'evaluated',
      'assessed', 'monitored', 'supervised', 'collaborated', 'presented', 'delivered'
    ],
    complianceTerms: [
      'sox', 'sarbanes oxley', 'sec', 'finra', 'cftc', 'basel', 'dodd frank', 'mifid',
      'kyc', 'aml', 'anti money laundering', 'compliance', 'regulatory', 'audit', 'internal controls'
    ]
  };

  const extractKeywordsJS = (text) => {
    const lowerText = text.toLowerCase();
    const sentences = text.split(/[.!?]+/);
    
    const findMatches = (terms) => {
      const matches = [];
      const matchCount = {};
      
      terms.forEach(term => {
        const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const count = (lowerText.match(regex) || []).length;
        if (count > 0) {
          matches.push(term);
          matchCount[term] = count;
        }
      });
      
      return matches.sort((a, b) => (matchCount[b] || 0) - (matchCount[a] || 0));
    };

    // Extract based on context and frequency
    const extractedKeywords = {
      highPriority: findMatches(financeKeywordDatabase.highPriorityTerms).slice(0, 8),
      mediumPriority: findMatches([...financeKeywordDatabase.industryTerms, ...financeKeywordDatabase.complianceTerms]).slice(0, 6),
      technicalSkills: findMatches(financeKeywordDatabase.technicalSkills).slice(0, 8),
      softSkills: findMatches(financeKeywordDatabase.softSkills).slice(0, 6),
      industryTerms: findMatches(financeKeywordDatabase.industryTerms).slice(0, 8),
      actionVerbs: findMatches(financeKeywordDatabase.actionVerbs).slice(0, 6)
    };

    // Add some intelligent context-based additions
    if (lowerText.includes('consulting') || lowerText.includes('advisory')) {
      extractedKeywords.highPriority.unshift('Management Consulting', 'Strategic Advisory');
    }
    if (lowerText.includes('audit') || lowerText.includes('assurance')) {
      extractedKeywords.highPriority.unshift('External Audit', 'Internal Audit');
    }

    return extractedKeywords;
  };

  const analyzeWithAI = async () => {
    const prompt = `Analyze this job description for Big 4 or bulge bracket finance roles and extract ATS-optimized keywords. Focus on finance, banking, consulting, and accounting terminology.

Job Description:
${jobDescription}

Return ONLY a JSON object with this exact structure:
{
  "highPriority": ["keyword1", "keyword2"],
  "mediumPriority": ["keyword3", "keyword4"],
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "industryTerms": ["term1", "term2"],
  "actionVerbs": ["verb1", "verb2"]
}

Extract 6-10 keywords per category. Focus on terms that would appear in ATS systems for finance roles. DO NOT include any text outside the JSON object.`;

    let response;
    
    switch (selectedLLM) {
      case 'anthropic':
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt }]
          })
        });
        break;
        
      case 'openai':
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2000
          })
        });
        break;
        
      case 'ollama':
        response = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama2",
            prompt: prompt,
            stream: false
          })
        });
        break;
        
      case 'huggingface':
        response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 2000,
              temperature: 0.7
            }
          })
        });
        break;
        
      default:
        throw new Error(`Unsupported LLM provider: ${selectedLLM}`);
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    let responseText;
    
    switch (selectedLLM) {
      case 'anthropic':
        responseText = data.content[0].text;
        break;
      case 'openai':
        responseText = data.choices[0].message.content;
        break;
      case 'ollama':
        responseText = data.response;
        break;
      case 'huggingface':
        responseText = data[0].generated_text;
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${selectedLLM}`);
    }
    
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(responseText);
  };

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      let extractedKeywords;
      
      if (useAI && apiKey.trim()) {
        extractedKeywords = await analyzeWithAI();
      } else {
        extractedKeywords = extractKeywordsJS(jobDescription);
      }
      
      setKeywords(extractedKeywords);
    } catch (error) {
      console.error("Error analyzing job description:", error);
      // Fallback to JS analysis if AI fails
      const fallbackKeywords = extractKeywordsJS(jobDescription);
      setKeywords(fallbackKeywords);
    }
    
    setIsAnalyzing(false);
  };

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const KeywordSection = ({ title, items, icon: Icon, priority = '' }) => {
    if (!items || items.length === 0) return null;
    
    const text = items.join(', ');
    const sectionKey = title.toLowerCase().replace(/\s+/g, '');
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                priority === 'HIGH' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {priority}
              </span>
            )}
          </div>
          <button
            onClick={() => copyToClipboard(text, sectionKey)}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {copiedSection === sectionKey ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium capitalize"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">plsgetmeajob.ai</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Optimize your resume for Big 4 and bulge bracket finance roles. Choose between free JavaScript analysis or enhanced AI analysis.
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-4 p-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Analysis Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Analysis Mode</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setUseAI(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                !useAI 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <Zap className="h-4 w-4" />
              Free Mode (JavaScript)
            </button>
            <button
              onClick={() => setUseAI(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                useAI 
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <Brain className="h-4 w-4" />
              AI Mode (Multiple LLMs)
            </button>
          </div>

          {showSettings && useAI && (
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="llmProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    LLM Provider
                  </label>
                  <select
                    id="llmProvider"
                    value={selectedLLM}
                    onChange={(e) => setSelectedLLM(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="anthropic">Claude (Anthropic)</option>
                    <option value="openai">GPT-3.5/4 (OpenAI)</option>
                    <option value="ollama">Ollama (Local/Free)</option>
                    <option value="huggingface">Hugging Face (Free tier)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    API Key {selectedLLM === 'ollama' ? '(Not needed for local)' : ''}
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={selectedLLM === 'ollama' ? 'Not needed for local Ollama' : 
                               selectedLLM === 'anthropic' ? 'sk-ant-...' :
                               selectedLLM === 'openai' ? 'sk-...' :
                               'hf_...'}
                    disabled={selectedLLM === 'ollama'}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {selectedLLM === 'anthropic' && (
                  <p>Get a free API key at console.anthropic.com</p>
                )}
                {selectedLLM === 'openai' && (
                  <p>Get an API key at platform.openai.com</p>
                )}
                {selectedLLM === 'ollama' && (
                  <p>Install Ollama locally and run: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">ollama run llama2</code></p>
                )}
                {selectedLLM === 'huggingface' && (
                  <p>Get a free API key at huggingface.co/settings/tokens</p>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 mt-2">
            {!useAI ? (
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-600 mt-0.5" />
                <span><strong>Free Mode:</strong> Uses intelligent keyword matching against a database of 100+ finance terms. Works offline, completely free.</span>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
                <span><strong>AI Mode:</strong> Uses AI models for context-aware analysis. Choose from Claude, GPT, local Ollama, or Hugging Face.</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here from Big 4 firms (Deloitte, PwC, EY, KPMG) or bulge bracket banks (Goldman Sachs, Morgan Stanley, JP Morgan, etc.)..."
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={analyzeJobDescription}
            disabled={!jobDescription.trim() || isAnalyzing || (useAI && !apiKey.trim())}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Analyzing...
              </>
            ) : (
              <>
                {useAI ? <Brain className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                Extract Keywords {useAI ? `(${selectedLLM === 'ollama' ? 'Local AI' : selectedLLM === 'huggingface' ? 'Free AI' : 'AI'})` : '(Free)'}
              </>
            )}
          </button>
        </div>

        {keywords && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ATS Keywords Extracted</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Analyzed using {useAI ? `${selectedLLM === 'ollama' ? 'local AI' : selectedLLM === 'huggingface' ? 'free AI' : 'AI-powered analysis'}` : 'intelligent keyword matching'}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              <KeywordSection
                title="High Priority Keywords"
                items={keywords.highPriority}
                icon={TrendingUp}
                priority="HIGH"
              />
              <KeywordSection
                title="Medium Priority Keywords"
                items={keywords.mediumPriority}
                icon={FileText}
                priority="MEDIUM"
              />
              <KeywordSection
                title="Technical Skills"
                items={keywords.technicalSkills}
                icon={Award}
              />
              <KeywordSection
                title="Soft Skills"
                items={keywords.softSkills}
                icon={Briefcase}
              />
              <KeywordSection
                title="Industry Terms"
                items={keywords.industryTerms}
                icon={TrendingUp}
              />
              <KeywordSection
                title="Action Verbs"
                items={keywords.actionVerbs}
                icon={FileText}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">💡 Pro Tips for ATS Optimization:</h3>
              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                <li>• Use high-priority keywords in your summary and experience sections</li>
                <li>• Match exact keyword phrases when possible (don't modify them)</li>
                <li>• Include both the spelled-out version and acronyms (e.g., "Mergers & Acquisitions (M&A)")</li>
                <li>• Integrate keywords naturally into your bullet points and accomplishments</li>
                <li>• Use action verbs to start your experience bullet points</li>
                <li>• {useAI ? 'AI analysis provides context-aware suggestions' : 'Free mode uses proven finance keyword patterns'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlsGetMeAJobAI;