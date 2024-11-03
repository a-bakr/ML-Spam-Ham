import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export class EmailClassifier {
  private model: tf.LayersModel | null = null;
  private encoder: use.UniversalSentenceEncoder | null = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  async load() {
    if (this.model && this.encoder) return;
    if (this.isLoading) return this.loadPromise;

    this.isLoading = true;
    this.loadPromise = (async () => {
      try {
        // Load USE model for text embedding
        this.encoder = await use.load();

        // Create a simple neural network for classification
        this.model = tf.sequential({
          layers: [
            tf.layers.dense({ units: 64, activation: 'relu', inputShape: [512] }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.dense({ units: 32, activation: 'relu' }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.dense({ units: 1, activation: 'sigmoid' })
          ]
        });

        // Compile the model
        this.model.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'binaryCrossentropy',
          metrics: ['accuracy']
        });

        // Initialize with some pre-trained weights (simplified for demo)
        const weights = await this.generateDemoWeights();
        this.model.setWeights(weights);
      } finally {
        this.isLoading = false;
      }
    })();

    return this.loadPromise;
  }

  private async generateDemoWeights() {
    // Generate some demo weights for illustration
    // In a real app, you'd load actual pre-trained weights
    return [
      tf.randomNormal([512, 64]),
      tf.zeros([64]),
      tf.randomNormal([64, 32]),
      tf.zeros([32]),
      tf.randomNormal([32, 1]),
      tf.zeros([1])
    ];
  }

  async classify(text: string): Promise<{ prediction: 'spam' | 'ham'; confidence: number }> {
    if (!this.model || !this.encoder) {
      throw new Error('Model not loaded');
    }

    // Get text embedding
    const embedding = await this.encoder.embed(text);
    
    // Make prediction
    const prediction = this.model.predict(embedding) as tf.Tensor;
    const probability = (await prediction.data())[0];
    
    // Cleanup
    embedding.dispose();
    prediction.dispose();

    // Convert probability to classification
    const isSpam = probability > 0.5;
    return {
      prediction: isSpam ? 'spam' : 'ham',
      confidence: isSpam ? probability : 1 - probability
    };
  }

  dispose() {
    this.model?.dispose();
    this.model = null;
  }
}