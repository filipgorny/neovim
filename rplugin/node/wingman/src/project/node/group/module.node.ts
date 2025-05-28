import { FolderNode } from "./folder.node";

export class ModuleNode extends Node {
  type = "module";

  folder: FolderNode;

  constructor(public name: string) {
    super();

    this.folder = new FolderNode(name);
  }
}
