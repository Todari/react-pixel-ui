#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 프로젝트 전체의 TypeScript와 ESLint 설정을 업데이트하는 스크립트
 */

const projectRoot = path.resolve(__dirname, '..');
const packagesDir = path.join(projectRoot, 'packages');
const appsDir = path.join(projectRoot, 'apps');

// 설정 템플릿들
const configs = {
  typescript: {
    'react-library': {
      extends: '@react-pixel-ui/typescript-config/react-library.json',
      compilerOptions: {
        outDir: './dist',
        rootDir: './src'
      },
      include: ['src/**/*'],
      exclude: ['dist', 'node_modules']
    },
    'react-app': {
      extends: '@react-pixel-ui/typescript-config/react-app.json',
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@/*': ['src/*']
        }
      }
    }
  },
  eslint: {
    library: {
      extends: ['@react-pixel-ui/eslint-config/library']
    },
    react: {
      extends: ['@react-pixel-ui/eslint-config/react']
    },
    storybook: {
      extends: ['@react-pixel-ui/eslint-config/storybook']
    }
  }
};

// 패키지별 설정 매핑
const packageConfigs = {
  'packages/core': { ts: 'react-library', eslint: 'library' },
  'packages/react': { ts: 'react-library', eslint: 'react' },
  'packages/demo': { ts: 'react-app', eslint: 'react' },
  'apps/storybook': { ts: 'react-app', eslint: 'storybook' }
};

function updateConfigs() {
  console.log('🔧 Updating TypeScript and ESLint configurations...\n');

  Object.entries(packageConfigs).forEach(([packagePath, config]) => {
    const fullPath = path.join(projectRoot, packagePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Skipping ${packagePath} (directory not found)`);
      return;
    }

    // TypeScript 설정 업데이트
    const tsconfigPath = path.join(fullPath, 'tsconfig.json');
    const tsConfig = configs.typescript[config.ts];
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsConfig, null, 2) + '\n');
    console.log(`✅ Updated ${packagePath}/tsconfig.json`);

    // ESLint 설정 업데이트
    const eslintPath = path.join(fullPath, '.eslintrc.js');
    const eslintConfig = configs.eslint[config.eslint];
    const eslintContent = `module.exports = ${JSON.stringify(eslintConfig, null, 2)};`;
    fs.writeFileSync(eslintPath, eslintContent + '\n');
    console.log(`✅ Updated ${packagePath}/.eslintrc.js`);
  });

  console.log('\n🎉 All configurations updated successfully!');
  console.log('\n💡 Run the following commands to apply changes:');
  console.log('   pnpm install');
  console.log('   pnpm type-check');
  console.log('   pnpm lint');
}

if (require.main === module) {
  updateConfigs();
}

module.exports = { updateConfigs };