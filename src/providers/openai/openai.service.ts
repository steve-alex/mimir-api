import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { Temperature } from './openai.type';

@Injectable()
export class OpenAIService {
  openai: OpenAIApi;

  constructor() {
    const config = new Configuration({
      organization: process.env.OPEN_AI_ORG_ID,
      apiKey: process.env.OPEN_AI_API_KEY,
    });
    this.openai = new OpenAIApi(config);
  }

  createTheSingularity(): unknown {
    return '🤷🏽‍♂️';
  }

  /**
   * Makes a call to Open AI's 'completion' API (https://platform.openai.com/docs/api-reference/completions)
   * Returns GPT 3.5's response to a provided prompt
   * @param prompt string: The text prompt to complete
   * @param temperature number: The temperature value to control the randomness of the response
   * @param maxTokens number: The maximum number of tokens in the response
   *
   * @returns Promise<string>
   */
  async createCompletion(
    prompt: string,
    temperature = Temperature.Low,
  ): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: 'gpt-3.5-turbo',
        prompt,
        temperature,
      });

      return response.data.choices[0].text;
    } catch (error) {
      throw new Error(`
        Error creating completion: ${error.message} \n
        Request Parameters:
          prompt: ${prompt} \n
          temperature: ${temperature} \n`);
    }
  }
}
