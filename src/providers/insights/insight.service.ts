import { Inject, Injectable } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import * as cheerio from 'cheerio';
import { WebpageDetails, YouTubeVideoInsights } from './insights.type';

@Injectable()
export class InsightService {
  constructor(@Inject(OpenAIService) private openAIService: OpenAIService) {}

  async getWebPageDetails(
    html: string,
    temp?: number,
  ): Promise<WebpageDetails> {
    const { title, content } = this.getWebpageTitleAndContent(html);
    const text = `${title} ${content}`;

    if (text.length < 14000) {
      // API has a 'token' limit of 4000 which is roughly 16000 characters. Take away about 1000 for prompts and 1000 for peace of mind.
      const { author, readingTime, categories, summary } =
        await this.runWebpageMetaDataExtraction(text, temp);

      return { title, author, readingTime, categories, summary };
    }

    const chunks = [];
    const chunkSize = this.getChunkSize(text.length);

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    const results: any = await Promise.all(
      chunks.map(async (chunk) =>
        this.runWebpageMetaDataExtraction(chunk, temp),
      ),
    );

    const authorChunks = results.reduce((acc, prev) => acc + prev?.author, '');
    const readingTimeChunks = results.reduce(
      (acc, prev) => acc + `${prev?.readingTime} Minutes `,
      '',
    );
    const categoriesChunks = results.reduce(
      (acc, prev) => acc + prev?.categories,
      '',
    );
    const summaryChunks = results.reduce(
      (acc, prev) => acc + prev?.summary,
      '',
    );

    const { author, readingTime, categories, summary } =
      await this.compileSummaryAndMetaData(
        authorChunks,
        readingTimeChunks,
        categoriesChunks,
        summaryChunks,
        temp,
      );

    return { title, author, readingTime, categories, summary };
  }

  private getWebpageTitleAndContent(html: string): {
    title: string;
    content: string;
  } {
    const $ = cheerio.load(html);
    const htmlElements = $('body')
      .find('p, h1, h2, h3, h4, h5, h6, li, a, span')
      .children();

    const title = getTitle();

    let content = '';
    htmlElements.each((index, element) => {
      content += extractText($(element));
    });

    return { title, content };

    function getTitle() {
      if (!$('title').text()) return 'Title';
      if ($('title').text().length > 100) return $('title').text().slice(0, 99);
      return $('title').text();
    }

    function extractText(element): string {
      let text = '';
      if (element.text()) {
        text += element.text();
      }
      element.children().each((i, child) => {
        text += extractText($(child));
      });
      return text;
    }
  }

  async runWebpageMetaDataExtraction(
    text: string,
    temp?: number,
  ): Promise<WebpageDetails> {
    //TODO - Update this so that users can update their reading speed!
    const answer = await this.openAIService.createCompletion(
      `{1} Does this text reference the main author? Yes? Return the author's name? No? Return ''.
       {2} How long in minutes would this take to read for an extremely fast reader?
       {3} Tag the 5 most relevant and broad categories. Return in the following format {1},{2},{3},{4},{5}
       {4} Write a detailed description of the points from the following text in a style that maximises information retention. RETURN THE ANSWER AS BULLET POINTS.

       Return in the following format:

       Author: {1} \n
       Reading Time: {2} \n
       Categories: {3} \n
       Summary: {4}

      ${text}`,
      temp,
    );

    const author = answer
      .split('\n')
      .find((t) => t.includes('Author:'))
      .split('Author:')[1];

    const readingTime = answer
      .split('\n')
      .find((t) => t.includes('Reading Time:'))
      .split('Reading Time:')[1]
      .split(' ')[1];

    const categories = answer
      .split('\n')
      .find((t) => t.includes('Categories:'))
      .split('Categories:')[1]
      .split(',')
      .filter((t) => t !== '')
      .filter((t) => t.length < 99)
      .map((t) => t.replace(/(?:\r\n|\r|\n)/g, '').replace(/^\s+|\s+$/g, '')); // TODO write comment describing all of this

    const summary = answer.split('Summary:')[1];

    return {
      author,
      readingTime,
      categories,
      summary,
    };
  }

  async compileSummaryAndMetaData(
    authorChunks: string,
    readingTimeChunks: string,
    categoriesChunks: string,
    summaryChunks: string,
    temp?: number,
  ): Promise<WebpageDetails> {
    const answer = await this.openAIService.createCompletion(
      `{1} Select the main author from the following options: ${authorChunks}.
       {2} Sum the total reading time from the following: ${readingTimeChunks}.
       {3} Compile the 5 most relevant and broad categories from the following: ${categoriesChunks}. Return in the following format {1},{2},{3},{4},{5}
       {4} Compile the main bullet points from the following text: ${summaryChunks}. Write in a descriptive format that maximises information retention. RETURN THE ANSWER AS BULLET POINTS.

       Return the answer to the questions above in the following structure:

       Author: {1} \n
       Reading Time: {2} \n
       Categories: {3} \n
       Summary: {4}`,
      temp,
    );

    const author = answer
      .split('\n')
      .find((t) => t.includes('Author:'))
      .split('Author:')[1];

    const readingTime = answer
      .split('\n')
      .find((t) => t.includes('Reading Time:'))
      .split('Reading Time:')[1]
      .split(' ')[1];

    const categories = answer
      .split('\n')
      .find((t) => t.includes('Categories:'))
      .split('Categories:')[1]
      .split(',')
      .filter((t) => t !== '')
      .filter((t) => t.length < 99)
      .map((t) => t.replace(/(?:\r\n|\r|\n)/g, '').replace(/^\s+|\s+$/g, '')); // TODO write comment describing all of this

    const summary = answer.split('Summary:')[1];

    return {
      author,
      readingTime,
      categories,
      summary,
    };
  }

  async extractYouTubeVideoInsights(
    text: string,
    temp?: number,
  ): Promise<YouTubeVideoInsights> {
    if (text.length < 14000) {
      // API has a 'token' limit of 4000 which is roughly 16000 characters. Take away about 1000 for prompts and 1000 for peace of mind.
      const { categories, summary } =
        await this.runYouTubeVideoInsightsExtraction(text, temp);

      return { categories, summary };
    }

    const chunks = [];
    const chunkSize = this.getChunkSize(text.length);

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    const results: any = await Promise.all(
      chunks.map(async (chunk) =>
        this.runYouTubeVideoInsightsExtraction(chunk, temp),
      ),
    );

    const categoriesChunks = results.reduce(
      (acc, prev) => acc + prev?.categories,
      '',
    );
    const summaryChunks = results.reduce(
      (acc, prev) => acc + prev?.summary,
      '',
    );

    const { categories, summary } = await this.compileYouTubeInsights(
      categoriesChunks,
      summaryChunks,
      temp,
    );

    return { categories, summary };
  }

  async runYouTubeVideoInsightsExtraction(
    text: string,
    temp?: number,
  ): Promise<YouTubeVideoInsights> {
    const answer = await this.openAIService.createCompletion(
      `1) Tag the 5 most relevant and broad categories. Return in the following format {1},{2},{3},{4},{5}
       2) Write a detailed description of the points from the following text in a style that maximises information retention. RETURN THE ANSWER AS BULLET POINTS.

       Return in the following format

       Categories: {1} \n
       Summary: {2}

       ${text}`,
      temp,
    );

    const categories = answer
      .split('\n')
      .find((t) => t.includes('Categories:'))
      .split('Categories:')[1]
      .split(',')
      .filter((t) => t !== '')
      .filter((t) => t.length < 99)
      .map((t) => t.replace(/(?:\r\n|\r|\n)/g, '').replace(/^\s+|\s+$/g, '')); // TODO write comment describing all of this

    const summary = answer.split('Summary:')[1];

    return {
      categories,
      summary,
    };
  }

  async compileYouTubeInsights(
    categoriesChunks: string,
    summaryChunks: string,
    temp?: number,
  ): Promise<YouTubeVideoInsights> {
    const answer = await this.openAIService.createCompletion(
      `Combine the 5 most relevant and broad categories from the following: ${categoriesChunks}. Return in the following format {1},{2},{3},{4},{5}
       Combine the bullet points from the following text: ${summaryChunks}. Write in a descriptive format that maximises information retention. RETURN THE ANSWER AS BULLET POINTS.

       Return in the following format:

       Categories: {1} \n
       Summary: {2}`,
      temp,
    );

    const categories = answer
      .split('\n')
      .find((t) => t.includes('Categories:'))
      .split('Categories:')[1]
      .split(',')
      .filter((t) => t !== '')
      .filter((t) => t.length < 99)
      .map((t) => t.replace(/(?:\r\n|\r|\n)/g, '').replace(/^\s+|\s+$/g, '')); // TODO write comment describing all of this

    const summary = answer.split('Summary:')[1];

    return {
      categories,
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
