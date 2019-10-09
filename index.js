const path = require("path");
const fs = require("fs");

const defaultDir = "/Users/carltonjoseph/cj/cj2019/";

const dirsToRemove = [];
let dirDepth = 0;
const dirDepthStop = 25; // safety not to loop forever

const rmDirRecursive = dir => {
  dirsToRemove.push(dir);
  (rdr = d => {
    const filesDirs = fs.readdirSync(d);
    filesDirs.forEach(fileDir => {
      const newFileDir = path.join(d, fileDir);
      if (fs.lstatSync(newFileDir).isDirectory()) return rdr(newFileDir);
      else fs.unlinkSync(newFileDir);
    });
    fs.rmdirSync(d);
  })(dir);
  console.log("removed", dir);
};

const getDirToRecurse = dir => {
  const dirsToRecurse = [];
  if (dirDepthStop !== -1 && dirDepth > dirDepthStop) return;
  const filesDirs = fs.readdirSync(dir);
  filesDirs.forEach(fileDir => {
    const newFileDir = path.join(dir, fileDir);
    if (!fs.lstatSync(newFileDir).isDirectory()) return;
    if (fileDir === "node_modules") return rmDirRecursive(newFileDir);
    dirsToRecurse.push(newFileDir);
  });
  return dirsToRecurse;
};

const startDir = process.argv[2] || defaultDir;

try {
  let dirsToRecurse = getDirToRecurse(startDir);
  let nextDirsToRecurse = [];
  do {
    nextDirsToRecurse = [];
    dirsToRecurse.forEach(dir => {
      nextDirsToRecurse = [...nextDirsToRecurse, ...getDirToRecurse(dir)];
    });
    dirDepth++;
    dirsToRecurse = nextDirsToRecurse;
    console.log(
      `Depth ${dirDepth}, Dirs ${dirsToRecurse.length}, Remove ${dirsToRemove.length}`
    );
  } while (nextDirsToRecurse.length > 0 && dirDepth < dirDepthStop);
} catch (e) {
  console.log(`${process.argv[0]} error! ${e}`);
}
