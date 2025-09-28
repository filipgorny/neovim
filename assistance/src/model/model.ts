export interface Model {
  prompt(message: string): Promise<string>;
}
