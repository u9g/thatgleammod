// import typescript from "rollup-plugin-typescript";
const typescript = require("rollup-plugin-typescript");
const tsconfig = require("./tsconfig.json");
const { walk } = require("./src/vendor/estree-walker");
const { generate: toJs } = require("astring");

const MagicString = require("magic-string").default;
const addCatchClause = () => {
  return {
    name: "add-catch-clause",
    transform(code) {
      const magicString = new MagicString(code);

      magicString.replace(
        /catch( |\n)+\{/g,
        (_, $1) => "catch" + $1 + "(____error____) {"
      );

      magicString.replace(
        /\/\/ Values marked with @internal are not part of the public API and may change/g,
        (_) =>
          "class Promise{}\n// Values marked with @internal are not part of the public API and may change"
      );

      magicString.replace(/globalThis\.Error/g, (_) => "Error");

      // const patch
      magicString.replace(/const /g, (_) => "let ");

      magicString.replace(/\/gsu\)/g, (_) => "/g)");

      magicString.replace(
        /\/\/\/ <reference types="[a-zA-Z0-9_./]+" \/\>/g,
        (_) => ""
      );

      return { code: magicString.toString() };
    },
  };
};

let j = 0;

const astChanger = () => {
  return {
    name: "ast-changer",
    transform(code, id) {
      try {
        ast = this.parse(code);
      } catch (err) {
        err.message += ` in ast-changer for id='${id}'`;
        throw err;
      }

      const magicString = new MagicString(code);

      walk(ast, {
        enter: (node) => {
          if (node.type === "ForOfStatement") {
            magicString.addSourcemapLocation(node.start);
            magicString.addSourcemapLocation(node.end);

            magicString.remove(node.start, node.end);

            let k = j++;

            // Can't use because a for-i loop doesn't work for things that just implement
            // Symbol.iterator
            //
            // magicString.appendRight(
            //   node.start,
            //   `{
            //     let x = [...${toJs(node.right)}];
            //   for (let i__${k} = 0; i__${k} < x.length; i__${k}++) {
            //     ${toJs(node.left).slice(0, -1)} = x[i__${k}];

            //     ${toJs(node.body).slice(1, -1)}
            //   }
            // }`
            // );

            magicString.appendRight(
              node.start,
              `{
                let iter_${k} = (${toJs(node.right)})[Symbol.iterator]()
                let next_${k} = iter_${k}.next()
                while (!next_${k}.done) {
                  ${toJs(node.left).slice(0, -1)} = next_${k}.value;
                  ${toJs(node.body).slice(1, -1)}
                  ;next_${k} = iter_${k}.next();
                }
              }`
            );
          } else if (
            node.type === "FunctionDeclaration" &&
            node.id.type === "Identifier" &&
            node.id.name === "makeError" &&
            node.body.type === "BlockStatement"
          ) {
            let { start, end } = node.body;
            magicString.addSourcemapLocation(start);
            magicString.addSourcemapLocation(end);

            magicString.remove(start, end);

            magicString.appendRight(
              start,
              `{
                return \`\${variant} in \${module}:\${fn}():\${line}, '\${message}'\`
              }`
            );
          }
        },
      });

      return { code: magicString.toString() };
    },
  };
};

module.exports = [
  {
    input: ".\\build\\dev\\javascript\\examplemod\\examplemod.mjs",
    plugins: [
      typescript({
        ...tsconfig.compilerOptions,
        include: "**/*.{js,ts}",
      }),
      addCatchClause(),
      astChanger(),
    ],
    output: { file: "out.js", format: "es" },
  },
];
