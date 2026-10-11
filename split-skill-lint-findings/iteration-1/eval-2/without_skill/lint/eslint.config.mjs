// Registry of per-skill lint companions. Add one import + spread per forked skill.
import vercelReactBestPractices from './vercel-react-best-practices.config.mjs'

export default [
  { ignores: ['**/node_modules/**', 'verify/**'] },
  ...vercelReactBestPractices,
]
