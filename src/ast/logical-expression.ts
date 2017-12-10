import { AST } from '..';

export class LogicalExpression {
    public type: "LogicalExpression";
    public operator: string;
    public left: AST;
    public right: AST;
}
