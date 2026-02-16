// Safe mathematical expression evaluator

export function safeEvaluate(expression: string): number | null {
  try {
    // Remove all whitespace
    const cleaned = expression.replace(/\s/g, '');
    
    // Only allow numbers, operators, parentheses, and decimal points
    if (!/^[0-9+\-*/().\s]+$/.test(cleaned)) {
      return null;
    }

    // Parse and evaluate the expression
    const result = evaluateExpression(cleaned);
    
    if (isNaN(result) || !isFinite(result)) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

function evaluateExpression(expr: string): number {
  // Simple recursive descent parser
  let index = 0;

  function peek(): string {
    return expr[index] || '';
  }

  function consume(): string {
    return expr[index++] || '';
  }

  function parseNumber(): number {
    let numStr = '';
    while (peek() && (peek().match(/[0-9.]/) || peek() === '.')) {
      numStr += consume();
    }
    return parseFloat(numStr);
  }

  function parseFactor(): number {
    if (peek() === '(') {
      consume(); // (
      const value = parseAddSub();
      consume(); // )
      return value;
    }

    if (peek() === '-') {
      consume();
      return -parseFactor();
    }

    if (peek() === '+') {
      consume();
      return parseFactor();
    }

    return parseNumber();
  }

  function parseMulDiv(): number {
    let left = parseFactor();

    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const right = parseFactor();
      
      if (op === '*') {
        left *= right;
      } else {
        if (right === 0) throw new Error('Division by zero');
        left /= right;
      }
    }

    return left;
  }

  function parseAddSub(): number {
    let left = parseMulDiv();

    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = parseMulDiv();
      
      if (op === '+') {
        left += right;
      } else {
        left -= right;
      }
    }

    return left;
  }

  return parseAddSub();
}
