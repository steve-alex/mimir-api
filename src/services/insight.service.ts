import { Inject, Injectable } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Injectable()
export class InsightService {
  constructor(@Inject(OpenAIService) private openAIService: OpenAIService) {}

  async categoriseText(input: string): Promise<string[]> {
    try {
      const response = await this.openAIService.createCompletion(
        `Label the following text with the FIVE most relevant broad categories that describe the content, return a single comma seperated line
        
        ${input}`,
      );

      return response.data.choices[0].text
        .split(',')
        .filter((category) => category !== '')
        .map((category) =>
          category.replace(/(?:\r\n|\r|\n)/g, '').replace(/^\s+|\s+$/g, ''),
        );
    } catch (err) {
      console.log('err =>', err.message);
    }
  }

  async summariseText(text: string): Promise<string> {
    const response = await this.openAIService.createCompletion(
      `How would you summarise this in a few sentences? Why?

      ${text}`,
    );

    return response.data.choices[0].text;
  }

  async getStringSimilarity(a: string, b: string): Promise<number> {
    const vectorA = await this.getEmbeddingVector(a);
    const vectorB = await this.getEmbeddingVector(b);
    return this.cosineSimilarity(vectorA, vectorB);
  }

  private async getEmbeddingVector(text: string): Promise<number[]> {
    const response = await this.openAIService.createEmbedding(text);

    console.log('response =>', response);
    console.log('response.data =>', response.data);
    console.log('response =>', response.data.object);

    return [1];
  }

  /**
   * Returns the similarity between between 2 normalised vectors, the returns a value between 0 and 1
   * https://www.geeksforgeeks.org/cosine-similarity/
   * https://beta.openai.com/docs/guides/embeddings/which-distance-function-should-i-use
   *
   * @param {*} a First embedding vector normalised to 1
   * @param {*} b Second embedding vector normalised to 1
   * @returns
   */
  private cosineSimilarity = (a: number[], b: number[]): number => {
    let dotproduct = 0;
    let mA = 0;
    let mB = 0;

    for (let i = 0; i < a.length; i++) {
      dotproduct += a[i] * b[i];
      mA += a[i] * a[i];
      mB += b[i] * b[i];
    }

    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);

    return dotproduct / (mA * mB);
  };
}
