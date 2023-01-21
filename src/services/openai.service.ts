import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class OpenAIService {
  openai;

  constructor() {
    const config = new Configuration({
      organization: process.env.OPEN_AI_ORG_ID,
      apiKey: process.env.OPEN_AI_API_KEY,
    });
    this.openai = new OpenAIApi(config);
  }

  createTheSingularity(): string {
    return 'Told you so 🤷🏽‍♂️';
  }

  /**
   * TODO - Fill this out
   * @param {*} prompt
   * @param {*} temperature
   * @param {*} maxTokens
   * @returns
   */
  createCompletion = async (
    prompt: string,
    temperature: any = 0.5,
    maxTokens: any = 500,
  ) => {
    return this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature,
      max_tokens: maxTokens,
    });
  };

  /**
   * TODO - Fill this out
   * @param {*} prompt
   * @param {*} temperature
   * @param {*} maxTokens
   * @returns
   */
  createEmbedding = async (
    prompt: string,
    temperature: any = 0.5,
    maxTokens: any = 500,
  ) => {
    return this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature,
      max_tokens: maxTokens,
    });
  };
}
