import { AST } from '..';

export class CallExpression {
    public type: "CallExpression";
    public callee: AST;
    public arguments: Array<AST>;
}
