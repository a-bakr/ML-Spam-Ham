import { useState, useEffect, useCallback } from 'react';
import { EmailClassifier } from '../lib/classifier';

export function useClassifier() {
  const [classifier, setClassifier] = useState<EmailClassifier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClassifier = async () => {
      try {
        const newClassifier = new EmailClassifier();
        await newClassifier.load();
        setClassifier(newClassifier);
        setError(null);
      } catch (err) {
        setError('Failed to load AI model');
        console.error('Error loading classifier:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadClassifier();

    return () => {
      classifier?.dispose();
    };
  }, []);

  const classifyEmail = useCallback(async (text: string) => {
    if (!classifier) throw new Error('Classifier not loaded');
    return classifier.classify(text);
  }, [classifier]);

  return { classifyEmail, isLoading, error };
}