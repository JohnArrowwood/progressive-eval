import {
    AST, 
    Dependencies
} from './'

const NONE: Dependencies = {};

function only(name): Dependencies { return { [name]: undefined }; }
function merge(...dep: Dependencies[]): Dependencies {
    return flatten(dep);
}
function flatten( dep: Dependencies[] ): Dependencies {
    let result = {} as Dependencies;
    for ( let i in dep ) {
        Object.assign(result,dep[i]);
    }
    return result;
}

/**
 * Recursively extract all the identifiers that this expression depends on
 * @param ast - the parsed expression to extract 
 */
export function dependencies(ast: AST): Dependencies {
    switch (ast.type) {
        case "Literal":               return NONE;
        case "Identifier":            return only(ast.name);
        case "BinaryExpression":      return merge( dependencies(ast.left), dependencies(ast.right) );
        case "LogicalExpression":     return merge( dependencies(ast.left), dependencies(ast.right) );
        case "UnaryExpression":       return dependencies(ast.argument);
        case "ArrayExpression":       return flatten( ast.elements.map( dependencies ) );
        case "MemberExpression":      return dependencies(ast.object);
        case "ThisExpression":        return only('this');
        case "CallExpression":        return merge( dependencies(ast.callee), flatten( ast.arguments.map( dependencies ) ) );
        case "ConditionalExpression": return merge( dependencies(ast.test), dependencies(ast.consequent), dependencies(ast.alternate) );
        default:                      return NONE;
    }
}

