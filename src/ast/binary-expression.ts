import { AST } from "..";

export class BinaryExpression {
    public type: "BinaryExpression";
    public operator: string;
    public left: AST;
    public right: AST;
}
