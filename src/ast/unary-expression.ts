import { AST } from '..';

export class UnaryExpression {
    public type: "UnaryExpression";
    public operator: string;
    public argument: AST;
    public prefix: boolean;
}
