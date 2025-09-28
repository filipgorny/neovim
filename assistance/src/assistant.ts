import { Model } from "./model/model";

type ReviewMessage = { line: number, message: string, type: "advice" | "warning" | "bug" }
type UpdateLine = { line: number, content: string };
type UpdateElement = { name: string, content: UpdateLine[] };

type ReviewResponse = { messages: ReviewMessage[], updates: UpdateElement[] };

export class Assistant {
  constructor(private readonly model: Model) {}

  async reviewContent(content: string): Promise<ReviewResponse | void> {
    const prompt = "Please review the current code. List all your advices, warnings, bugs detected, and return them "
      + " in a json object with the following format:\n"
      + " { messages: [{ line: number, message: string, type: \"advice\" | \"warning\" | \"bug\" }], updates: [{name: string, content: [{line: number, content: string }]]}} \n\n"
      + " Dont add anything that is not this json, so parser will be able to parse your response as a valid json object."
      + " In the messages please fill it with your comments to the code, spotted bugs etc. In the updates, please add your updates propositions, with name of every one,"
      + " and then list of lines and content of them."
      + " Here is the code to review:\n\n"
      + content;

    const reviewRepsonse = await this.model.prompt(prompt);

    try {
      const reviewResponseJson: ReviewResponse = JSON.parse(reviewRepsonse);

      return reviewResponseJson;
    } catch (e) {
      console.error("Error parsing review response ", e);
    }
  }
}
