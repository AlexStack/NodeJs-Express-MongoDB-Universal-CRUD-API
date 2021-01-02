npm install
mkdir -p node_modules_layer/nodejs
mv node_modules node_modules_layer/nodejs/node_modules
cd node_modules_layer/
zip -r nodejs.zip ./*
# upload nodejs.zip to aws lambda layer via aws lambda layer UI
# add the layer to lambda function via aws lambda function UI
# rm -rf node_modules_layer && rm -rf package-lock.json