import React, { useState } from 'react';
import { AlertTriangle, Shield, Send, Trash2, Loader2, Brain } from 'lucide-react';
import { useClassifier } from './hooks/useClassifier';

interface ClassificationResult {
  prediction: 'spam' | 'ham';
  confidence: number;
}

function App() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { classifyEmail, isLoading: isModelLoading, error: modelError } = useClassifier();

  const handleClassification = async () => {
    if (!email.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await classifyEmail(email.trim());
      setResult(result);
    } catch (err) {
      setResult(null);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(`Failed to classify email: ${errorMessage}`);
      console.error('Classification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">AI-Powered Email Classifier</h1>
          </div>

          {isModelLoading ? (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-blue-600">Loading AI model...</p>
            </div>
          ) : modelError ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-600">{modelError}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="email-content" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  id="email-content"
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Paste your email content here..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                onClick={handleClassification}
                disabled={!email.trim() || loading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                {loading ? 'Analyzing...' : 'Analyze with AI'}
              </button>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {result && (
                <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                  result.prediction === 'spam' 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {result.prediction === 'spam' ? (
                    <>
                      <AlertTriangle className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Spam Detected!</p>
                        <p className="text-sm opacity-90">
                          Our AI model indicates this is spam (Confidence: {(result.confidence * 100).toFixed(1)}%). Be cautious!
                        </p>
                      </div>
                      <Trash2 className="w-5 h-5 ml-auto" />
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Safe Content</p>
                        <p className="text-sm opacity-90">
                          Our AI model indicates this is legitimate (Confidence: {(result.confidence * 100).toFixed(1)}%).
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Powered by TensorFlow.js and Universal Sentence Encoder
        </p>
      </div>
    </div>
  );
}

export default App;