import { AST } from "..";

export class ArrayExpression {
    public type: "ArrayExpression";
    public elements: Array<AST>;
}
