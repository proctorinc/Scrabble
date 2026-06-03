import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    ignores: ["old-app/**", "node_modules/**"],
  },
];

export default config;
