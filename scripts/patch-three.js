const fs = require('fs');
const path = require('path');

const threeCjsPath = path.join(__dirname, '..', 'node_modules', 'three', 'build', 'three.cjs');

if (fs.existsSync(threeCjsPath)) {
  let content = fs.readFileSync(threeCjsPath, 'utf8');
  if (content.includes('process.emitWarning(') && !content.includes('typeof process.emitWarning === \'function\'')) {
    content = content.replace(
      'process.emitWarning(',
      'if (typeof process !== \'undefined\' && typeof process.emitWarning === \'function\') {\n\tprocess.emitWarning('
    );
    // Find the end of the emitWarning call and close the if block
    const callEnd = content.indexOf('{ type: \'DeprecationWarning\', code: \'THREE_CJS_DEPRECATED\' }\n);');
    if (callEnd !== -1) {
      const insertAt = callEnd + '{ type: \'DeprecationWarning\', code: \'THREE_CJS_DEPRECATED\' }\n);'.length;
      content = content.slice(0, insertAt) + '\n}' + content.slice(insertAt);
    }
    fs.writeFileSync(threeCjsPath, content, 'utf8');
    console.log('✓ Successfully patched three.cjs for React Native / Hermes compatibility');
  }
}

