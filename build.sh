#/bin/bash

npm run build
npx webpack --config webpack.config.cjs
cp -r js/ dist
cp -r meshes/ dist
cp inspecto_urdf_http.urdf dist
