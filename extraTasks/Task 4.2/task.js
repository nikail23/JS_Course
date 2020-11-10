function add(number1, number2) {
    if (number2) {
        return number1 + number2;
    } else {
        return function(number2) {
            return number2 + number1;
        }
    }
}

function sub(number1, number2) {
    if (number2) {
        return number1 - number2;
    } else {
        return function(number2) {
            return number2 - number1;
        }
    }
}

function mul(number1, number2) {
    if (number2) {
        return number1 * number2;
    } else {
        return function(number2) {
            return number2 * number1;
        }
    }
}

function div(number1, number2) {
    if (number2) {
        return number1 / number2;
    } else {
        return function(number2) {
            return number2 / number1;
        }
    }
}

function pipe(...args) {
    return function(number) {
        for (let i = 0; i < args.length; i++) {
            const func = args[i];
            number = func(number);
        }
        return number;
    }
}

console.log(add(10, 15));
let add1 = add(1);
console.log(add1(2));

console.log(mul(10, 2));
let mul5 = mul(5);
console.log(mul5(2));

console.log(div(30, 15));
let div10 = div(10);
console.log(div10(50));

console.log(sub(10, 15));
let sub1 = sub(1);
console.log(sub1(2));

let doSmth = pipe(add(10), sub(4), mul(3), div(2));
console.log(doSmth(0));