/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	modulePaths: ['<rootDir>/src/'],
	testPathIgnorePatterns: ['/node_modules/(?!my-package).+.js$', '/dist'],
};
