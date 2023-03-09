import fs from 'fs';
import path from 'path';

export const readDirectory = async (basePath: string) => {
  const output = [];
  const baseDirectory = path.join(process.cwd(), basePath);
  const files = fs.readdirSync(baseDirectory);
  for (const file of files) {
    if (file.endsWith('svg')) {
      output.push({
        name: file,
        source: readSvg(path.join(baseDirectory, file)),
        key: file.split('.')[0],
      });
    }
  }
  return output;
};

export const readSvg = (svgPath: string, relativePath: boolean = true) => {
  if (!relativePath) {
    svgPath = path.join(process.cwd(), svgPath);
  }
  return fs.readFileSync(svgPath).toString();
};
