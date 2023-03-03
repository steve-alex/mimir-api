import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { Temperature } from '../../types/types';

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

  createTheSingularity(): string {
    return 'Told you so 🤷🏽‍♂️';
  }

  /**
   * Makes a call to Open AI's 'completion' API (https://platform.openai.com/docs/api-reference/completions)
   * Returns GPT 3.5's response to a provided prompt
   * @param prompt string: The text prompt to complete
   * @param temperature number: The temperature value to control the randomness of the response
   * @param maxTokens number: The maximum number of tokens in the response
   *
   * @returns Promise<any>
   */
  createCompletion = async (
    prompt: string,
    temperature = Temperature.Low,
    maxTokens = 1500,
  ): Promise<any> => {
    //TODO - make sure that prompt length is validated
    try {
      return this.openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        temperature,
        max_tokens: maxTokens,
      });
    } catch (error) {
      throw new Error(`
        Error creating completion: ${error.message} \n
        Request Parameters:
          prompt: ${prompt} \n
          temperature: ${temperature} \n
          maxTokens: ${maxTokens} \n`);
    }
  };

  /**
   * Makes a call to Open AI's GPT 3.5 'embedding' API (https://platform.openai.com/docs/api-reference/embeddings)
   * Returns an 'embedding vector' of a provided prompt
   * https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
   * @param prompt string: The text prompt to complete
   * @param temperature number: The temperature value to control the randomness of the response
   * @param maxTokens number: The maximum number of tokens in the response
   *
   * @returns Promise<any>
   */
  createEmbedding = async (
    prompt: string,
    temperature: any = Temperature.Low,
    maxTokens: any = 500,
  ): Promise<any> => {
    //TODO - make sure that prompt length is validated
    try {
      return this.openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        temperature,
        max_tokens: maxTokens,
      });
    } catch (error) {
      throw new Error(`
      Error creating completion: ${error.message} \n
      Request Parameters:
        prompt: ${prompt} \n
        temperature: ${temperature} \n
        maxTokens: ${maxTokens} \n`);
    }
  };
}
