import * as expr from 'expression-eval';

import { 
    AST, 
    VariableValues,
    Expression,
    dependencies
} from './';

/**
 * returns true if the expression can be evaluated in this context
 * @param ast 
 * @param context 
 */
export function canEvaluate( ast: AST, context: VariableValues ) {
    let dep = dependencies( ast );
    for ( let i in dep ) {
        if ( ! context.hasOwnProperty(i) ) return false;
    }
    return true;
}
