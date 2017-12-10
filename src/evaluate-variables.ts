import * as expr from 'expression-eval';

import {
    VariableValues,
    SetOfVariables,

} from '.';
import { evaluationOrder } from './evaluation-order';

/**
 * Evaluate a set of variables
 * @param vars - the definitions of the variables to be evaluted
 * @param context - the pre-defined values to inject into the evaluation
 */
export function evaluateVariables( vars: SetOfVariables, context: VariableValues ): VariableValues {

    // IMPORTANT!  Assumes that everything has its dependencies met
    // DO NOT CALL UNLESS/UNTIL YOU KNOW THAT IS TRUE!

    let result: VariableValues = {};

    for ( let v of evaluationOrder( vars, context ) ) {
        result[v.name] = v.evaluate( Object.assign({},context,result) );
    }

    return result;
}