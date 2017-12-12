import * as expr from 'expression-eval';

import { 
    AST, 
    VariableValues,
    Expression,
    Identifier
} from './';

/**
 * returns true if the expression can be evaluated in this context.
 * NOTE: Does not perform type checking, so no guarantee is made
 * that an expression will evaluate to a reasonable value
 * @param ast 
 * @param context 
 */
function every( element: Array<boolean> ) {
    for ( let result of element ) {
        if ( result === false ) return false;
    }
    return true;
}
export function canEvaluate( ast: AST, context: VariableValues = {} ): boolean {
    let localThis = this;

    function can( ast: AST ) {
        switch ( ast.type ) {
            case "Literal": 
                return true;
    
            case "Identifier": 
                return context.hasOwnProperty( ast.name );
    
            case "BinaryExpression": 
                return (
                    can( ast.left ) && 
                    can( ast.right )
                );
    
            case "LogicalExpression": 
                return (
                    can( ast.left ) && 
                    can( ast.right )
                );
    
            case "UnaryExpression": 
                return can( ast.argument );
    
            case "ArrayExpression": 
                return every( ast.elements.map( (e) => can( e ) ) );
    
            case "MemberExpression":
                if ( ! can( ast.object ) ) return false;
                let object = expr.eval.apply( localThis, [ ast.object, context ] );
                let property;
                if ( ast.computed ) {
                    if ( ! can( ast.property ) ) return false;
                    property = expr.eval.apply( localThis, [ ast.property, context ] );
                } else {
                    property = ((ast.property) as Identifier ).name;
                }
                return object.hasOwnProperty(property);
    
            case "ThisExpression": 
                return true;
    
            case "CallExpression": 
                return (
                    can( ast.callee ) &&
                    every( ast.arguments.map( (e) => can( e ) ) ) &&
                    typeof( expr.eval.apply( localThis, [ ast.callee, context ] ) ) === "function"
                );
    
            case "ConditionalExpression":
                return (
                    can( ast.test ) &&
                    can( ast.consequent ) &&
                    can( ast.alternate )
                );
    
            default: return false;
        }
    
    }
    return can( ast );
}
