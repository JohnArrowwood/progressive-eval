import * as expr from 'expression-eval';

import { 
    Expression, 
    AST, 
    VariableValues
} from '.';

/**
 * Wrapper for expression-eval.parse()
 * @param e - Expression to parse
 */
export function parse( e: Expression ): AST {
    return expr.parse( e );
}

/**
 * Wrapper for expression-eval.eval()
 * @param e - Expression or pre-parsed expression
 * @param context - interpretation context
 */
export function evaluate( e: Expression | AST, context: VariableValues = {} ) {
    let ast;
    if ( typeof( e ) === 'string' ) {
        ast = expr.parse( e );
    } else {
        ast = e;
    }
    return expr.eval( ast, context );
}
