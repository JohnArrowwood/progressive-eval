// imports
import { ArrayExpression }       from './ast/array-expression';
import { BinaryExpression }      from './ast/binary-expression';
import { CallExpression }        from './ast/call-expression';
import { ConditionalExpression } from './ast/conditional-expression';
import { Identifier }            from './ast/identifier';
import { Literal }               from './ast/literal';
import { LogicalExpression }     from './ast/logical-expression';
import { MemberExpression }      from './ast/member-expression';
import { ThisExpression }        from './ast/this-expression';
import { UnaryExpression }       from './ast/unary-expression';
import { ParseError }            from './ast/parse-error';

import { Variable } from './variable';

// exports

// interfaces and types

export { ArrayExpression }       from './ast/array-expression';
export { BinaryExpression }      from './ast/binary-expression';
export { CallExpression }        from './ast/call-expression';
export { ConditionalExpression } from './ast/conditional-expression';
export { Identifier }            from './ast/identifier';
export { Literal }               from './ast/literal';
export { LogicalExpression }     from './ast/logical-expression';
export { MemberExpression }      from './ast/member-expression';
export { ThisExpression }        from './ast/this-expression';
export { UnaryExpression }       from './ast/unary-expression';
export { ParseError }            from './ast/parse-error';

export type AST = 
    ArrayExpression |
    BinaryExpression |
    CallExpression |
    ConditionalExpression |
    Identifier |
    Literal |
    LogicalExpression |
    MemberExpression |
    ThisExpression |
    UnaryExpression |
    ParseError;

export type ObjectAsSet  = { [key:string]: any };
export type VariableName = string;
export type Expression   = string;
export type Dependencies = { [identifier:string]: undefined };

export      { Variable }              from './variable';
export type SetOfVariables            = { [identifier:string]: Variable };
export type VariableValues            = { [identifier:string]: any };
export      { ProgressiveEvaluation } from './progressive-evaluation';

// functions

export { parse, evaluate }       from './expression-eval-wrapper';
export { dependencies }          from './dependencies';
export { canEvaluate }           from './can-evaluate';
export { evaluationOrder }       from './evaluation-order';
export { evaluateVariables }     from './evaluate-variables';
