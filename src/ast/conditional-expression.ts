import { AST } from '..';

export class ConditionalExpression {
    public type: "ConditionalExpression";
    public test: AST;
    public consequent: AST;
    public alternate: AST;
}
