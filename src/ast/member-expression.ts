import { AST } from '..';

export class MemberExpression {
    public type: "MemberExpression";
    public computed: boolean;
    public object: AST;
    public property: AST;
}
