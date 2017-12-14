import { 
    Variable,
    SetOfVariables 
} from "../src/index";

export function buildSet(obj): SetOfVariables {
    let result = {};
    for( let name in obj ) {
       let v = new Variable();
       v.name = name;
       v.expr = obj[name].toString();
       result[name] = v;
    }
    return result;
}