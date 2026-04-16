/** @format */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactCompiler: true,
	images: {
		unoptimized: true,
	},
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},
};

export default nextConfig;
