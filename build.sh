#/bin/bash

npm run build
npx webpack --config webpack.config.cjs
cp -r js/ dist
