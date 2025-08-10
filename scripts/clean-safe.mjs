#!/usr/bin/env node
import { rm } from 'fs/promises'
import { existsSync } from 'fs'
import { spawnSync } from 'child_process'

async function main(){
  if (!existsSync('.next')) return
  try {
    await rm('.next', { recursive: true, force: true })
    return
  } catch (e) {
    // Fallbacks for Windows/OneDrive EPERM
    if (process.platform === 'win32') {
      // Try PowerShell
      const ps = spawnSync('powershell', ['-NoProfile','-Command','Remove-Item -LiteralPath ".next" -Force -Recurse -ErrorAction SilentlyContinue'], { stdio: 'inherit' })
      if (ps.status === 0 || !existsSync('.next')) return
      // Try cmd rmdir
      const cmd = spawnSync('cmd', ['/c','rmdir','/s','/q','.next'], { stdio: 'inherit' })
      if (cmd.status === 0 || !existsSync('.next')) return
    }
    // Last resort: rename then try delete again
    try {
      const tmp = `.next_to_delete_${Date.now()}`
      const mv = spawnSync(process.platform === 'win32' ? 'cmd' : 'mv', process.platform === 'win32' ? ['/c','rename','.next', tmp] : ['.next', tmp])
      if (mv.status === 0) {
        await rm(tmp, { recursive: true, force: true })
        return
      }
    } catch {}
    console.error('Failed to remove .next. You may need to close any running dev servers and retry.')
    process.exit(1)
  }
}

main()