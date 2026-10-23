import { existsSync, readdirSync, readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

/** One package that ends up in the build, as /licenses/frontend.json lists it. */
interface PackageLicense {
    name: string
    version: string
    /** SPDX id like "MIT"; "UNKNOWN" if the package doesn't say */
    license: string
    repository: string | null
    /** the LICENSE file of the package, null if it has none */
    licenseText: string | null
    /** the NOTICE file, which some licenses (Apache-2.0) ask to pass on */
    noticeText: string | null
}

const NODE_MODULES = '/node_modules/'

/** The repository as a web address: "git+https://….git", "git@github.com:a/b" and "a/b" all become https://github.com/a/b. */
function repositoryUrl(repository: string | undefined): string | null {
    if (!repository) return null
    const url = repository
        .replace(/^git\+/, '')
        .replace(/^git@github\.com[:/]/, 'https://github.com/')
        .replace(/^(git|http):\/\//, 'https://')
        .replace(/\.git$/, '')
    return /^[\w.-]+\/[\w.-]+$/.test(url) ? `https://github.com/${url}` : url
}

/** The folder and name of the package a module comes from, null for the app's own files. */
function packageOf(moduleId: string): { dir: string; name: string } | null {
    const id = moduleId.replace(/\\/g, '/').replace(/\?.*$/, '')
    const at = id.lastIndexOf(NODE_MODULES)
    if (at < 0) return null
    const [first, second] = id.slice(at + NODE_MODULES.length).split('/')
    const name = first.startsWith('@') ? `${first}/${second}` : first
    return { dir: id.slice(0, at + NODE_MODULES.length) + name, name }
}

function readFile(dir: string, pattern: RegExp): string | null {
    const file = readdirSync(dir).find((entry) => pattern.test(entry))
    return file ? readFileSync(`${dir}/${file}`, 'utf8').trim() : null
}

function describe(dir: string): PackageLicense {
    const pkg = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8'))
    const license = typeof pkg.license === 'string' ? pkg.license : pkg.license?.type ?? pkg.licenses?.map((l: { type: string }) => l.type).join(' OR ')
    return {
        name: pkg.name,
        version: pkg.version,
        license: license || 'UNKNOWN',
        repository: repositoryUrl(typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url),
        licenseText: readFile(dir, /^(licen[cs]e|copying)(\b|[.-])/i),
        noticeText: readFile(dir, /^notice(\b|\.)/i),
    }
}

/**
 * Writes licenses/frontend.json into the build: every package any module of the build comes from
 * (scripts and styles, like the fonts), with its license. The page /lizenzen shows it.
 */
export default function licensesPlugin(): Plugin {
    return {
        name: 'jan-website-licenses',
        apply: 'build',
        generateBundle() {
            const packages = new Map<string, PackageLicense>()
            for (const id of this.getModuleIds()) {
                const found = packageOf(id)
                if (!found || !existsSync(`${found.dir}/package.json`)) continue
                const info = describe(found.dir)
                packages.set(`${info.name}@${info.version}`, info)
            }
            const list = [...packages.values()].sort((a, b) => a.name.localeCompare(b.name))
            this.emitFile({ type: 'asset', fileName: 'licenses/frontend.json', source: JSON.stringify(list) })
        },
    }
}
