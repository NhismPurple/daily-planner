import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",           // build ra static HTML/CSS/JS
  basePath: "/daily-planner", // vì site nằm ở nhismpurple.github.io/daily-planner/
  assetPrefix: "/daily-planner/",
  images: {
    unoptimized: true,        // GitHub Pages không có server để tối ưu ảnh
  },
};

export default nextConfig;