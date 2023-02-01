import { Inject, Injectable } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { auth } from 'google-auth-library';

@Injectable()
export class InsightService {
  constructor(@Inject(OpenAIService) private openAIService: OpenAIService) {}

  async categoriseText(
    input: string,
    temp?: number,
  ): Promise<{ categories: string[] }> {
    try {
      const response = await this.openAIService.createCompletion(
        `Give the following text up to 5 relevant and broad categories. Return in the following format
        {1},{2},{3},{4},{5}

        ${input}`,
        temp,
      );

      const categories = response.data.choices[0].text
        .split(',')
        .filter((t) => t !== '')
        .filter((t) => t.length < 99)
        .map((t) => t.replace(/(?:\r\n|\r|\n)/g, '').replace(/^\s+|\s+$/g, '')); // TODO write comment describing all of this

      return { categories };
    } catch (err) {
      console.log('err =>', err.message);
    }
  }

  /**
   *
   * @param text
   * @param temp
   * @returns
   */
  async summariseAndExtractMetaData(
    text: string,
    temp?: number,
  ): Promise<{ author: string; readingTime: string; summary: string }> {
    if (text.length < 14000) {
      // API has a 'token' limit of 4000 which is roughly 16000 characters. Take away about 1000 for prompts and 1000 for peace of mind.
      const { author, readingTime, summary } =
        await this.runSummaryAndMetaDataExtraction(text, temp);

      return { author, readingTime, summary };
    }

    const chunks = [];
    const chunkSize = this.getChunkSize(text.length);

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    const results: any = await Promise.all(
      chunks.map(async (chunk) =>
        this.runSummaryAndMetaDataExtraction(chunk, temp),
      ),
    );

    const authorChunks = results.reduce((acc, prev) => acc + prev?.author, '');
    const readingTimeChunks = results.reduce(
      (acc, prev) => acc + prev?.readingTime,
      '',
    );
    const summaryChunks = results.reduce(
      (acc, prev) => acc + prev?.summary,
      '',
    );

    const { author, readingTime, summary } =
      await this.compileSummaryAndMetaData(
        authorChunks,
        readingTimeChunks,
        summaryChunks,
        temp,
      );

    return { author, readingTime, summary };
  }

  async compileSummaryAndMetaData(
    authorChunks: string,
    readingTimeChunks: string,
    summaryChunks: string,
    temp?: number,
  ): Promise<any> {
    const response = await this.openAIService.createCompletion(
      `1) Select the main author from the following options: ${authorChunks}.
       2) Sum the total reading time from the following: ${readingTimeChunks}.
       3) Compile the main arguments from the following using bullet points. Write in a style that increases the amount of information retained: ${summaryChunks}

       Return in the following format:

       Author: {1} \n
       Reading Time: {2} \n
       Summary: {3}`,
      temp,
    );

    const author = response.data.choices[0].text
      .split('\n')
      .find((t) => t.includes('Author: '))
      .split('Author: ')[1];

    const readingTime = response.data.choices[0].text
      .split('\n')
      .find((t) => t.includes('Reading Time: '))
      .split('Reading Time: ')[1];

    const summary = response.data.choices[0].text.split('Summary: ')[1];

    return {
      author,
      readingTime,
      summary,
    };
  }

  async runSummaryAndMetaDataExtraction(
    text: string,
    temp?: number,
  ): Promise<any> {
    //TODO - Update this so that users can update their reading speed!
    const response = await this.openAIService.createCompletion(
      `1) Does this text reference the main author? Yes? Return the author's name? No? Return ''.
       2) How long in minutes would this take to read for an extremely fast reader?
       3) Summarise the arguments from following text in up to 300 words using bullet points. Write in a style that increases the amount of information retained.
       
       Return in the following format

       Author: {1} \n
       Reading Time: {2} \n
       Summary: {3}
      ${text}`,
      temp,
    );

    const author = response.data.choices[0].text
      .split('\n')
      .find((t) => t.includes('Author: '))
      .split('Author: ')[1];

    const readingTime = response.data.choices[0].text
      .split('\n')
      .find((t) => t.includes('Reading Time: '))
      .split('Reading Time: ')[1];

    const summary = response.data.choices[0].text.split('Summary: ')[1];

    return {
      author,
      readingTime,
      summary,
    };
  }

  getChunkSize(length: number): number {
    if (length > 55000) throw Error('This is basically a book bro');
    if (length <= 55000 && length >= 41000) return length / 4;
    if (length < 41000) return length / 3;
  }

  async getStringSimilarity(a: string, b: string): Promise<number> {
    const vectorA = await this.getEmbeddingVector(a);
    const vectorB = await this.getEmbeddingVector(b);
    return this.cosineSimilarity(vectorA, vectorB);
  }

  private async getEmbeddingVector(text: string): Promise<number[]> {
    const response = await this.openAIService.createEmbedding(text);
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
