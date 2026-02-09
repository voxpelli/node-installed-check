import pathModule from 'node:path';
import resolveWorkspaceRootPkg from 'resolve-workspace-root';

const { resolveWorkspaceRootAsync } = resolveWorkspaceRootPkg;

/**
 * Find the ultimate parent workspace root by walking up the directory tree
 *
 * @param {string} dir
 * @returns {Promise<string|undefined>}
 */
export async function findUltimateWorkspaceRoot (dir) {
  const currentRoot = await resolveWorkspaceRootAsync(dir);
  if (!currentRoot) return;

  // Keep looking for parent workspace roots by checking parent directories
  let checkDir = pathModule.dirname(currentRoot);
  let ultimateRoot = currentRoot;

  while (checkDir && checkDir !== ultimateRoot) {
    const parentRoot = await resolveWorkspaceRootAsync(checkDir);

    // If we found a parent workspace root that contains our current root
    if (parentRoot && ultimateRoot.startsWith(parentRoot + pathModule.sep)) {
      ultimateRoot = parentRoot;
      checkDir = pathModule.dirname(parentRoot);
    } else {
      // Move up one directory and continue searching
      const newCheckDir = pathModule.dirname(checkDir);
      if (newCheckDir === checkDir) {
        // Reached filesystem root
        break;
      }
      checkDir = newCheckDir;
    }
  }

  return ultimateRoot;
}
