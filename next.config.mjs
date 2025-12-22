import pkg from "workflow/next";
const { withWorkflow } = pkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withWorkflow(nextConfig);
