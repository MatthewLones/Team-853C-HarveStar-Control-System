const { override, overrideDevServer } = require("customize-cra");

const devServerConfig = () => config => {
  config.allowedHosts = 'all'; // ✅ allows all hosts
  return config;
};

module.exports = {
  webpack: override(),
  devServer: overrideDevServer(devServerConfig())
};
