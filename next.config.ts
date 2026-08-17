import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', 'pg-boss', 'exceljs', 'node-cron', 'nodemailer'],
};

export default nextConfig;
